import { Request, Response } from "express";
import { userUseCases } from "../useCases/user.useCases";
import { User } from "../models/user.model";

const userControllers = {
  create: async (req: Request, res: Response) => {
    try {
      const user = req.body;
      await userUseCases.create(user as User);
      res.status(200).json({
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
      }
      res.status(500).json({
        message: error,
      });
    }
  },
};

export { userControllers };
