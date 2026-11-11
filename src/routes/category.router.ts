import { Router } from "express";
import { categoryControllers } from "../controllers/category.controller";
import { createCategoryValidator } from "../middleware/category.middleware";
import { validator } from "../middleware/validator";
import { authorizeRoles, verifyToken } from "../middleware/jwt";
import { USER_ROLE } from "../models/user.model";

const categoryRouter = Router();

categoryRouter.get("/", categoryControllers.list);
categoryRouter.post(
  "/",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  createCategoryValidator,
  validator,
  categoryControllers.create,
);
categoryRouter.get("/:id", categoryControllers.getById);
categoryRouter.patch(
  "/:id",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  categoryControllers.update,
);
categoryRouter.delete(
  "/:id",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  categoryControllers.delete,
);

export { categoryRouter };
