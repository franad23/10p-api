// import { NextFunction, Request, Response } from "express";
// import { Category } from "../models/category.model";

// function createMiddleware(req: Request, res: Response, next: NextFunction) {
//   const category = req.body as Category;
//   if (!category) {
//     return res.status(400).json({
//       message: "Informacion de categoria es obligatoria",
//     });
//   }
//   if (!category.name || !category.active || !category.description) {
//     return res.status(400).json({
//       message: "Todos los campos de categoria son oblitarios",
//     });
//   }

//   next();
// }

// export { createMiddleware };

import { body } from "express-validator";

const createCategoryValidator = body("name")
  .notEmpty()
  .withMessage("El campo name es obligatorio")
  .bail()
  .isLength({
    min: 2,
  })
  .withMessage("Debe tener como minimo 2 caracteres")
  .isLength({
    max: 10,
  })
  .withMessage("Debe tener como maximo 10 caracteres");
body("description")
  .notEmpty()
  .withMessage("El campo description es obligatorio");
body("active").notEmpty().withMessage("El campo description es obligatorio");

export { createCategoryValidator };
