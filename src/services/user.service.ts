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
  findById: async (id: string) => {
    return await UserModel.findById(id).select("-password");
  },
  list: async () => {
    return await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 });
  },
  updateRole: async (id: string, role: User["role"]) => {
    return await UserModel.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");
  },
  updateActive: async (id: string, active: boolean) => {
    return await UserModel.findByIdAndUpdate(
      id,
      { active },
      { new: true, runValidators: true },
    ).select("-password");
  },
};

export { userServices };
