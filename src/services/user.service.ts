import { HydratedDocument } from "mongoose";
import { UserModel, User } from "../models/user.model";

const userServices = {
  create: async (user: User) => {
    await UserModel.create(user);
  },
  findByEmail: async (
    email: string,
  ): Promise<HydratedDocument<User> | null> => {
    const userFound = await UserModel.findOne({
      email,
    });
    return userFound;
  },
};

export { userServices };
