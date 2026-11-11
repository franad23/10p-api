import { Request, Response } from "express";
import { orderUseCases } from "../useCases/order.useCases";

const orderControllers = {
  create: async (req: Request, res: Response) => {
    try {
      const order = await orderUseCases.create(req.user!.id, req.body.items);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT-NOT-AVAILABLE") {
        return res.status(400).json({ message: "Producto no disponible" });
      }
      if (error instanceof Error && error.message === "INSUFFICIENT-STOCK") {
        return res.status(400).json({ message: "Stock insuficiente" });
      }
      if (error instanceof Error && error.message === "MIXED-CURRENCIES") {
        return res.status(400).json({
          message: "Todos los productos deben tener la misma moneda",
        });
      }
      return res.status(500).json({ message: error });
    }
  },
  listMine: async (req: Request, res: Response) => {
    try {
      const orders = await orderUseCases.listMine(req.user!.id);
      res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  list: async (_req: Request, res: Response) => {
    try {
      const orders = await orderUseCases.list();
      res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const order = await orderUseCases.getById(
        req.params.id as string,
        req.user!.id,
        req.user!.role,
      );
      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER-NOT-FOUND") {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      if (error instanceof Error && error.message === "ORDER-FORBIDDEN") {
        return res.status(403).json({ message: "No podés ver esta orden" });
      }
      return res.status(500).json({ message: error });
    }
  },
};

export { orderControllers };
