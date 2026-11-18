import { Router } from "express";
import { chatControllers } from "../controllers/chat.controller";
import { verifyToken } from "../middleware/jwt";

const chatRouter = Router();

chatRouter.post("/", verifyToken, chatControllers.ask);

export { chatRouter };
