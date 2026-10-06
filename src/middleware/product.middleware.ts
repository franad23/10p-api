import { CURRENCY, Product } from "../data/products";

function validateProductBody(req, res, next) {
  const product: Product = req.body;

  if (
    !product.name ||
    !product.currency ||
    !product.price ||
    (!product.stock && typeof product.stock !== "number")
  ) {
    return res.status(400).json({
      message: "Faltan datos",
    });
  }
  if (typeof product.name !== "string") {
    return res.status(400).json({
      message: "El nombre debe ser un string",
    });
  }
  if (product.name.length < 2 && product.name.length >= 255) {
    return res.status(400).json({
      message: "el nombre debe estar entre 2 y 255 caracteres.",
    });
  }
  if (product.currency !== CURRENCY.ARS && product.currency !== CURRENCY.USD) {
    return res.status(400).json({
      message: "Solo se aceptan ARS y USD",
    });
  }
  if (product.stock < 0) {
    return res.status(400).json({
      message: "El stock NO puede ser negativo",
    });
  }
  next();
}

export { validateProductBody };
