import express from "express";
import { productControllers } from "./controllers/product.controller";

const app = express();

app.use(express.json());

app.post("/product", productControllers.create);
app.delete("/product/:id", productControllers.delete);
app.get("/product/:id", productControllers.getById);
app.get("/product", productControllers.list);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
