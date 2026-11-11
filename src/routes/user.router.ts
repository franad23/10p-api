import { Router } from "express";
import { userControllers } from "../controllers/user.controller";
import { authorizeRoles, verifyToken } from "../middleware/jwt";
import { USER_ROLE } from "../models/user.model";

const userRouter = Router();

userRouter.post("/", userControllers.create);
userRouter.post("/register", userControllers.create);
userRouter.post("/login", userControllers.checkCredentials);
userRouter.get("/me", verifyToken, userControllers.getProfile);
userRouter.get(
  "/",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  userControllers.list,
);
userRouter.patch(
  "/:id/role",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  userControllers.updateRole,
);
userRouter.patch(
  "/:id/active",
  verifyToken,
  authorizeRoles(USER_ROLE.ADMIN),
  userControllers.updateActive,
);

export { userRouter };
