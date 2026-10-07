import { UserModel, User } from "../models/user.model";

const userServices = {
  create: async (user: User) => {
    await UserModel.create(user);
  },
  findByEmail: async (email: string): Promise<User | null> => {
    const userFound = await UserModel.findOne({
      email,
    });
    return userFound;
  },
};

export { userServices };
