import express from "express";
import { productControllers } from "./controllers/product.controller";

const app = express();

app.use(express.json());

app.delete("/product/:id", productControllers.delete);
app.get("/", (req, res) => {
  res.send("Hola mundoooooo");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});
