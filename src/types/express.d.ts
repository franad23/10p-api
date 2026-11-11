import { USER_ROLE } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: USER_ROLE;
      };
    }
  }
}

export {};
