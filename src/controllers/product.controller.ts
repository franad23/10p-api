import { productUseCases } from "../useCases/product.useCases";

const productControllers = {
  delete: (req, res) => {
    try {
      const idToDelete = req.params.id;
      productUseCases.deleteById(idToDelete);
      res.status(200).json({
        message: "Producto borrado correctamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "PRODUCT-NOT-FOUND") {
          res.status(401).json({
            message: "Producto no encontrado para borrar",
          });
        } else if (error.message === "PRODUCT-STOCKED") {
          res.status(401).json({
            message: "No se pueden borrar productos con stock.",
          });
        }
      }
    }
  },
};

export { productControllers };
