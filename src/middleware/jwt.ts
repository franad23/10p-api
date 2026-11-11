import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import { USER_ROLE, UserModel } from "../models/user.model";

async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autenticación requerido",
    });
  }

  const jwtSecret = process.env.JWT_KEY;
  if (!jwtSecret) {
    return res.status(500).json({
      message: "El servidor no tiene configurada la autenticación",
    });
  }

  try {
    const payload = jwt.verify(authorization.slice(7), jwtSecret);
    if (typeof payload === "string" || !payload.id) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const user = await UserModel.findById(payload.id).select("email role active");
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    if (!user.active) {
      return res.status(403).json({ message: "El usuario está inactivo" });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role ?? USER_ROLE.CLIENT,
    };
    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido o vencido",
    });
  }
}

function authorizeRoles(...allowedRoles: USER_ROLE[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "No tenés permisos para realizar esta acción",
      });
    }
    next();
  };
}

export { authorizeRoles, verifyToken };
