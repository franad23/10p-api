import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("DB Conectada");
  } catch (error) {
    console.log("ERROR AL CONECTAR DB", error);
  }
}

export { connectDB };
