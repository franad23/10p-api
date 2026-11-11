import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { USER_ROLE, UserModel } from "../models/user.model";

dotenv.config();

const users = [
  {
    name: "Usuario",
    lastname: "Administrador",
    email: "admin@demo.com",
    password: "Admin1234",
    role: USER_ROLE.ADMIN,
  },
  {
    name: "Usuario",
    lastname: "Cliente",
    email: "cliente@demo.com",
    password: "Cliente1234",
    role: USER_ROLE.CLIENT,
  },
];

async function seedUsers() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta MONGO_URI en el archivo .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    for (const user of users) {
      const password = await bcrypt.hash(user.password, 10);
      await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          ...user,
          password,
          active: true,
        },
        { upsert: true, runValidators: true },
      );
    }

    console.log("Usuarios de prueba creados:");
    console.log("ADMIN   admin@demo.com / Admin1234");
    console.log("CLIENT  cliente@demo.com / Cliente1234");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedUsers();
