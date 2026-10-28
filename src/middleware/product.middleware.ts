import { body } from "express-validator";
import { CURRENCY, Product } from "../data/products";

// function validateProductBody(req, res, next) {
//   const product: Product = req.body;

//   if (
//     !product.name ||
//     !product.currency ||
//     !product.price ||
//     (!product.stock && typeof product.stock !== "number")
//   ) {
//     return res.status(400).json({
//       message: "Faltan datos",
//     });
//   }
//   if (typeof product.name !== "string") {
//     return res.status(400).json({
//       message: "El nombre debe ser un string",
//     });
//   }
//   if (product.name.length < 2 && product.name.length >= 255) {
//     return res.status(400).json({
//       message: "el nombre debe estar entre 2 y 255 caracteres.",
//     });
//   }
//   if (product.currency !== CURRENCY.ARS && product.currency !== CURRENCY.USD) {
//     return res.status(400).json({
//       message: "Solo se aceptan ARS y USD",
//     });
//   }
//   if (product.stock < 0) {
//     return res.status(400).json({
//       message: "El stock NO puede ser negativo",
//     });
//   }
//   next();
// }

// interface Product {
//   name: string;
//   price: number;
//   currency: CURRENCY;
//   stock: number;
//   active: boolean;
//   category_id: Types.ObjectId;
// }
const validateProductBody = [
  body("name").notEmpty().withMessage("El campo nombre es obligatorio").bail(),

  body("price")
    .notEmpty()
    .withMessage("El campo precio es obligatorio")
    .bail()
    .isNumeric()
    .withMessage("El precio debe ser numérico"),

  body("currency")
    .notEmpty()
    .withMessage("El campo moneda es obligatorio")
    .bail()
    .isIn(Object.values(CURRENCY))
    .withMessage("La moneda debe ser ARS o USD"),

  body("active")
    .notEmpty()
    .withMessage("El campo activo es obligatorio")
    .bail()
    .isBoolean()
    .withMessage("El campo activo debe ser booleano"),

  body("category_id")
    .notEmpty()
    .withMessage("El campo categoría es obligatorio")
    .bail()
    .isMongoId()
    .withMessage("El campo categoría debe ser un MongoId"),

  body("createdBy_id")
    .notEmpty()
    .withMessage("El campo usuario es obligatorio")
    .bail()
    .isMongoId()
    .withMessage("El campo usuario debe ser un MongoId"),
];

export { validateProductBody };
