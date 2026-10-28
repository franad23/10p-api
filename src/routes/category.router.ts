import { Router } from "express";
import { categoryControllers } from "../controllers/category.controller";
import { createCategoryValidator } from "../middleware/category.middleware";
import { validator } from "../middleware/validator";
import { verifyToken } from "../middleware/jwt";

const categoryRouter = Router();

categoryRouter.get("/", categoryControllers.list);
categoryRouter.post(
  "/",
  createCategoryValidator,
  validator,
  verifyToken,
  categoryControllers.create,
);
categoryRouter.get("/:id", categoryControllers.getById);
categoryRouter.patch("/:id", categoryControllers.update);
categoryRouter.delete("/:id", verifyToken, categoryControllers.delete);

export { categoryRouter };
