import { Router } from "express";
import { orderControllers } from "../controllers/order.controller";
import { authorizeRoles, verifyToken } from "../middleware/jwt";
import { validateOrder } from "../middleware/order.middleware";
import { USER_ROLE } from "../models/user.model";

const orderRouter = Router();

orderRouter.use(verifyToken);
orderRouter.post("/", validateOrder, orderControllers.create);
orderRouter.get("/me", orderControllers.listMine);
orderRouter.get(
  "/",
  authorizeRoles(USER_ROLE.ADMIN),
  orderControllers.list,
);
orderRouter.get("/:id", orderControllers.getById);

export { orderRouter };
