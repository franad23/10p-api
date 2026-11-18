import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { productControllers } from "./controllers/product.controller";
import { connectDB } from "./config/connectDb";
import { authorizeRoles, verifyToken } from "./middleware/jwt";
import { validateProductBody } from "./middleware/product.middleware";
import { uploadProductImage } from "./middleware/upload.middleware";
import { validator } from "./middleware/validator";
import { USER_ROLE } from "./models/user.model";
import { categoryRouter } from "./routes/category.router";
import { chatRouter } from "./routes/chat.router";
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
      if (!origin || allowedOrigins.has(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  }),
);

// En Vercel una instancia puede atender varias solicitudes. connectDB reutiliza
// la misma conexión y evita abrir una conexión nueva en cada invocación.
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ message: "Base de datos no disponible" });
  }
});

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
app.get("/product/:id", productControllers.getById);
app.patch(
  "/product/:id",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  productControllers.update,
);
app.get("/product", productControllers.list);

app.use("/category", categoryRouter);
app.use("/chat", chatRouter);
app.use("/order", orderRouter);
app.use("/payment", paymentRouter);

export default app;
