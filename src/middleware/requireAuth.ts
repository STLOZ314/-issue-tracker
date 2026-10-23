import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../auth.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Please sign in first" });
      return;
    }

    req.user = {
      userId: session.user.id,
      fullName: session.user.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};
