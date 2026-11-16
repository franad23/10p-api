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
const localFrontendUrl = "http://localhost:5173";
const configuredFrontendUrl = process.env.FRONTEND_URL ?? process.env.APP_URL;
const allowedOrigins = new Set(
  [localFrontendUrl, configuredFrontendUrl]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => origin.replace(/\/$/, "")),
);

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Las llamadas servidor-a-servidor, como el webhook, no envían Origin.
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

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

const port = Number(process.env.PORT) || 3001;

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server corriendo en el puerto ${port}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar el servidor", error);
  process.exit(1);
});
