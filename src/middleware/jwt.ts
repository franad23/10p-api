import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";

function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        message: "Token invalido",
      });
    }
    jwt.verify(token, process.env.JWT_KEY as string);
    next();
  } catch (error) {
    res.status(400).json({
      message: "Token invalido",
    });
  }
}

export { verifyToken };
