import type { Request, Response, NextFunction } from "express";

import { assignableRoles } from "../permissions.js";
import { getUserRole } from "../userLookup.js";

// An issue may only be assigned to a Developer, Business Analyst
// or Quality Analyst.
export async function requireAssignableUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await getUserRole(req.body.userId);
    if (role === undefined) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!(assignableRoles as readonly string[]).includes(role)) {
      res.status(400).json({
        error:
          "Issues can only be assigned to a Developer, Business Analyst " +
          "or Quality Analyst",
      });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
