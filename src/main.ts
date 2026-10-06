import express from "express";
import { productControllers } from "./controllers/product.controller";
import { validateProductBody } from "./middleware/product.middleware";
import { connectDB } from "./config/connectDb";

const app = express();

app.use(express.json());

app.post("/product", validateProductBody, productControllers.create);
// app.delete("/product/:id", productControllers.delete);
app.get("/product/:id", productControllers.getById);
app.patch("/product/:id", productControllers.update);
// app.get("/product", productControllers.list);

const PORT = 3000;
connectDB();
app.listen(PORT, async () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
