import { Router } from "express";
import { APIError } from "better-auth/api";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../auth.js";
import { requirePermission } from "../middleware/requirePermission.js";
import { validateBody } from "../middleware/validate.js";
import { setRoleSchema } from "../schemas/userSchemas.js";

export const usersRouter = Router();

usersRouter.patch(
  "/:id/role",
  requirePermission("user", "set-role"),
  validateBody(setRoleSchema),
  async (req, res, next) => {
    // Nobody changes their own role. If the only Technical Manager demoted
    // themselves, no one would be left who is allowed to fix it.
    if (req.params.id === req.user.userId) {
      res.status(400).json({ error: "You cannot change your own role" });
      return;
    }

    try {
      const result = await auth.api.setRole({
        body: { userId: req.params.id as string, role: req.body.role },
        // Passing the headers lets better-auth see WHO is asking.
        headers: fromNodeHeaders(req.headers),
      });
      res.json(result);
    } catch (err) {
      // better-auth explains itself, e.g. 404 "User not found".
      if (err instanceof APIError) {
        res.status(Number(err.statusCode)).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);
