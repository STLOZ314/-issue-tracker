import type { Request, Response, NextFunction } from "express";

import { auth } from "../auth.js";
import { statement } from "../permissions.js";

type Resource = keyof typeof statement;

export function requirePermission<R extends Resource>(
  resource: R,
  action: (typeof statement)[R][number],
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await auth.api.userHasPermission({
        body: {
          userId: req.user.userId,
          permissions: { [resource]: [action] },
        },
      });

      if (!result.success) {
        res.status(403).json({ error: `Your role may not ${resource}:${action}` });
        return;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
