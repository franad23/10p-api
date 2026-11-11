import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";

function validateOrder(req: Request, res: Response, next: NextFunction) {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "La orden debe tener productos" });
  }

  const invalidItem = items.some(
    (item) =>
      !isValidObjectId(item.product_id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1,
  );
  if (invalidItem) {
    return res.status(400).json({ message: "Producto o cantidad inválidos" });
  }
  next();
}

export { validateOrder };
