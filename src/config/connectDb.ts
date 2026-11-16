import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI no está configurada");

  await mongoose.connect(mongoUri);
  console.log("DB Conectada");
}

export { connectDB };
