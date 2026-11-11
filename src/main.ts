import express from "express";
import { productControllers } from "./controllers/product.controller";
import { validateProductBody } from "./middleware/product.middleware";
import { connectDB } from "./config/connectDb";
import cors from "cors";
import { categoryRouter } from "./routes/category.router";
import { validator } from "./middleware/validator";
import { uploadProductImage } from "./middleware/upload.middleware";
import { authorizeRoles, verifyToken } from "./middleware/jwt";
import { USER_ROLE } from "./models/user.model";
import { orderRouter } from "./routes/order.router";
import { paymentRouter } from "./routes/payment.router";
import { userRouter } from "./routes/user.router";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use("/user", userRouter);

app.post(
  "/product",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  uploadProductImage,
  validateProductBody,
  validator,
  productControllers.create,
);
// app.delete("/product/:id", productControllers.delete);
app.get("/product/:id", productControllers.getById);
app.patch(
  "/product/:id",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  productControllers.update,
);
app.get("/product", productControllers.list);

app.use("/category", categoryRouter);
app.use("/order", orderRouter);
app.use("/payment", paymentRouter);

const PORT = 3001;
connectDB();
app.listen(PORT, async () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
