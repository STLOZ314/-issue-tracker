import { Request, Response, NextFunction } from "express";

export function attachCurrentUser(req: Request, _res: Response, next: NextFunction) {
  req.user = { userId: "user-placeholder-001", fullName: "Jordan Casey" };
  next();
}
