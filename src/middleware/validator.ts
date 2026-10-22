import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

function validator(req: Request, res: Response, next: NextFunction) {
  const hasErrors = validationResult(req);
  if (!hasErrors.isEmpty()) {
    return res.status(400).json({
      errors: hasErrors.array(),
    });
  }
  next();
}

export { validator };
