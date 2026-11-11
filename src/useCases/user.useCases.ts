import { USER_ROLE, User } from "../models/user.model";
import { userServices } from "../services/user.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { isValidObjectId } from "mongoose";
dotenv.config();

const userUseCases = {
  create: async (user: User) => {
    const userExists = await userServices.findByEmail(user.email);
    if (userExists) {
      throw new Error("USER-ALREADY-EXISTS");
    }
    const passwordHashed = await bcrypt.hash(user.password, 10);
    await userServices.create({
      ...user,
      password: passwordHashed,
      role: USER_ROLE.CLIENT,
    });
  },
  checkCredentials: async (
    userCredencials: Pick<User, "email" | "password">,
  ) => {
    const userExists = await userServices.findByEmail(userCredencials.email);
    if (!userExists) {
      throw new Error("INVALID-CREDENTIALS");
    }
    const checkPassword = await bcrypt.compare(
      userCredencials.password,
      userExists.password,
    );
    if (!checkPassword) {
      throw new Error("INVALID-CREDENTIALS");
    }
    if (!userExists.active) {
      throw new Error("USER-INACTIVE");
    }
    const token = jwt.sign(
      {
        id: userExists._id,
        name: userExists.name,
        lastname: userExists.lastname,
        email: userExists.email,
        role: userExists.role ?? USER_ROLE.CLIENT,
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" },
    );
    return token;
  },
  getProfile: async (id: string) => {
    if (!isValidObjectId(id)) throw new Error("USER-NOT-FOUND");
    const user = await userServices.findById(id);
    if (!user) throw new Error("USER-NOT-FOUND");
    return user;
  },
  list: async () => {
    return await userServices.list();
  },
  updateRole: async (actorId: string, id: string, role: USER_ROLE) => {
    if (actorId === id) throw new Error("CANNOT-UPDATE-SELF");
    if (!isValidObjectId(id)) throw new Error("USER-NOT-FOUND");
    if (!Object.values(USER_ROLE).includes(role)) {
      throw new Error("INVALID-ROLE");
    }
    const user = await userServices.updateRole(id, role);
    if (!user) throw new Error("USER-NOT-FOUND");
    return user;
  },
  updateActive: async (actorId: string, id: string, active: boolean) => {
    if (actorId === id) throw new Error("CANNOT-UPDATE-SELF");
    if (!isValidObjectId(id)) throw new Error("USER-NOT-FOUND");
    if (typeof active !== "boolean") throw new Error("INVALID-ACTIVE");
    const user = await userServices.updateActive(id, active);
    if (!user) throw new Error("USER-NOT-FOUND");
    return user;
  },
};

export { userUseCases };
