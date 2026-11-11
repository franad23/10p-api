import { Request, Response } from "express";
import { userUseCases } from "../useCases/user.useCases";
import { USER_ROLE, User } from "../models/user.model";

const userControllers = {
  create: async (req: Request, res: Response) => {
    try {
      const user = req.body;
      await userUseCases.create(user as User);
      res.status(201).json({
        message: "Usuario creado con exito!",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "USER-ALREADY-EXISTS") {
          return res.status(400).json({
            message: "El usuario ya existe",
          });
        }
      }
      res.status(500).json({
        message: error,
      });
    }
  },
  checkCredentials: async (req: Request, res: Response) => {
    try {
      const userCredencials = req.body;
      const token = await userUseCases.checkCredentials(userCredencials);
      res.status(200).json({
        message: "Usuario logueado correctamente",
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INVALID-CREDENTIALS") {
          return res.status(401).json({
            message: "Credenciales invalidas",
          });
        }
        if (error.message === "USER-INACTIVE") {
          return res.status(403).json({
            message: "El usuario está inactivo",
          });
        }
      }
      res.status(500).json({
        message: error,
      });
    }
  },
  getProfile: async (req: Request, res: Response) => {
    try {
      const user = await userUseCases.getProfile(req.user!.id);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === "USER-NOT-FOUND") {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      return res.status(500).json({ message: error });
    }
  },
  list: async (_req: Request, res: Response) => {
    try {
      const users = await userUseCases.list();
      res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  updateRole: async (req: Request, res: Response) => {
    try {
      const user = await userUseCases.updateRole(
        req.user!.id,
        req.params.id as string,
        req.body.role as USER_ROLE,
      );
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === "USER-NOT-FOUND") {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (error instanceof Error && error.message === "INVALID-ROLE") {
        return res.status(400).json({ message: "Rol inválido" });
      }
      if (error instanceof Error && error.message === "CANNOT-UPDATE-SELF") {
        return res.status(400).json({
          message: "No podés modificar tu propio rol o estado",
        });
      }
      return res.status(500).json({ message: error });
    }
  },
  updateActive: async (req: Request, res: Response) => {
    try {
      const user = await userUseCases.updateActive(
        req.user!.id,
        req.params.id as string,
        req.body.active,
      );
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === "USER-NOT-FOUND") {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      if (error instanceof Error && error.message === "INVALID-ACTIVE") {
        return res.status(400).json({
          message: "El campo active debe ser booleano",
        });
      }
      if (error instanceof Error && error.message === "CANNOT-UPDATE-SELF") {
        return res.status(400).json({
          message: "No podés modificar tu propio rol o estado",
        });
      }
      return res.status(500).json({ message: error });
    }
  },
};

export { userControllers };
