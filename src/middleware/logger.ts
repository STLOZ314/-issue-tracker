import debug from "debug";
import { NextFunction, Request, Response } from "express";

const log = debug("issue-tracker:request");

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  log(`${req.method} ${req.url}`);
  next();
}
