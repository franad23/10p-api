import { Request, Response } from "express";
import { productUseCases } from "../useCases/product.useCases";

const productControllers = {
  getById: (req, res) => {
    try {
      const id = req.params.id;
      const productFound = productUseCases.getById(parseInt(id));
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
  delete: (req: Request<{ id: string }>, res: Response) => {
    try {
      const idToDelete = req.params.id;
      productUseCases.deleteById(parseInt(idToDelete));
      res.status(200).json({
        message: "Producto borrado correctamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PRODUCT-NOT-FOUND") {
          res.status(401).json({
            message: "Producto no encontrado",
          });
        }
        if (error.message === "PRODUCT-STOCKED") {
          res.status(401).json({
            message: "No se pueden borrar productos con stock.",
          });
        }
      }
    }
  },
};

export { productControllers };
