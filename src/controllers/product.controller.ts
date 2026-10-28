import { Request, Response } from "express";
import { productUseCases } from "../useCases/product.useCases";
import { Product } from "../models/product.model";

const productControllers = {
  list: async (req: Request, res: Response) => {
    try {
      const productsFound = await productUseCases.list();
      res.status(200).json(productsFound);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  create: (req: Request, res: Response) => {
    try {
      const product: Product = req.body;

      productUseCases.create(product);
      res.status(200).json({
        message: "Producto creado con exito",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const productFound = await productUseCases.getById(id as string);
      res.status(200).json(productFound);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PRODUCT-NOT-FOUND") {
          res.status(401).json({
            message: "Producto no encontrado",
          });
        }
      }
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const idToUpdate = req.params.id;
      const dataToUpdate = req.body;
      await productUseCases.update(
        idToUpdate as string,
        dataToUpdate as Product,
      );
      res.status(200).json({
        message: "Producto Actualizado con exito",
      });
    } catch (error) {
      res.status(500).json({
        message: "Produto no actualizado",
      });
    }
  },
  // delete: (req: Request<{ id: string }>, res: Response) => {
  //   try {
  //     const idToDelete = req.params.id;
  //     productUseCases.deleteById(parseInt(idToDelete));
  //     res.status(200).json({
  //       message: "Producto borrado correctamente",
  //     });
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       if (error.message === "PRODUCT-NOT-FOUND") {
  //         res.status(401).json({
  //           message: "Producto no encontrado",
  //         });
  //       }
  //       if (error.message === "PRODUCT-STOCKED") {
  //         res.status(401).json({
  //           message: "No se pueden borrar productos con stock.",
  //         });
  //       }
  //     }
  //   }
  // },
};

export { productControllers };
