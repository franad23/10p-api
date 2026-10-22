import { Request, Response } from "express";
import { categoryUseCases } from "../useCases/category.useCases";
import { Category } from "../models/category.model";

const categoryControllers = {
  list: async (req: Request, res: Response) => {
    try {
      const categoriesFound = await categoryUseCases.list();
      res.status(200).json(categoriesFound);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener las categorias",
      });
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const category = req.body;
      await categoryUseCases.create(category as Category);
      res.status(200).json({
        message: "Categoria creada con exito",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CATEGORY-ALREADY-EXISTS") {
          return res.status(400).json({
            message: "La categoria ya existe",
          });
        }
      }
      console.log(error);
      res.status(500).json({
        message: "Categoria no creada",
      });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const categoryFound = await categoryUseCases.getById(id as string);
      res.status(200).json(categoryFound);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CATEGORY-NOT-FOUND") {
          return res.status(404).json({
            message: "Categoria no encontrada",
          });
        }
      }
      res.status(500).json({
        message: "Error al obtener la categoria",
      });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const idToUpdate = req.params.id;
      const dataToUpdate = req.body;
      await categoryUseCases.update(
        idToUpdate as string,
        dataToUpdate as Category,
      );
      res.status(200).json({
        message: "Categoria actualizada con exito",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CATEGORY-NOT-FOUND") {
          return res.status(404).json({
            message: "Categoria no encontrada",
          });
        }
      }
      res.status(500).json({
        message: "Categoria no actualizada",
      });
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const idToDelete = req.params.id;
      await categoryUseCases.deleteById(idToDelete as string);
      res.status(200).json({
        message: "Categoria borrada correctamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "CATEGORY-NOT-FOUND") {
          return res.status(404).json({
            message: "Categoria no encontrada",
          });
        }
      }
      res.status(500).json({
        message: "Categoria no borrada",
      });
    }
  },
};

export { categoryControllers };
