import { User } from "../models/user.model";
import { userServices } from "../services/user.service";
import bcrypt from "bcrypt";

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
  },
};

export { userUseCases };
