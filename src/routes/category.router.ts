import { Router } from "express";
import { categoryControllers } from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.get("/", categoryControllers.list);
categoryRouter.post("/", categoryControllers.create);
categoryRouter.get("/:id", categoryControllers.getById);
categoryRouter.patch("/:id", categoryControllers.update);
categoryRouter.delete("/:id", categoryControllers.delete);

export { categoryRouter };
