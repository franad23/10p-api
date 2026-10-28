import express from "express";
import { productControllers } from "./controllers/product.controller";
import { validateProductBody } from "./middleware/product.middleware";
import { connectDB } from "./config/connectDb";
import { userControllers } from "./controllers/user.controller";
import { categoryControllers } from "./controllers/category.controller";
import cors from "cors";
import { categoryRouter } from "./routes/category.router";
import { validator } from "./middleware/validator";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.post("/user", userControllers.create);
app.post("/user/login", userControllers.checkCredentials);

app.post("/product", validateProductBody, validator, productControllers.create);
// app.delete("/product/:id", productControllers.delete);
app.get("/product/:id", productControllers.getById);
app.patch("/product/:id", productControllers.update);
app.get("/product", productControllers.list);

app.use("/category", categoryRouter);

const PORT = 3000;
connectDB();
app.listen(PORT, async () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
