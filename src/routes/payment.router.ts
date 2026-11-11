import { Router } from "express";
import { paymentControllers } from "../controllers/payment.controller";
import { verifyToken } from "../middleware/jwt";

const paymentRouter = Router();

paymentRouter.get("/success", paymentControllers.success);
paymentRouter.get("/pending", paymentControllers.pending);
paymentRouter.get("/failure", paymentControllers.failure);
paymentRouter.post(
  "/checkout/:orderId",
  verifyToken,
  paymentControllers.createCheckout,
);
paymentRouter.post(
  "/sync/:orderId",
  verifyToken,
  paymentControllers.sync,
);

export { paymentRouter };
