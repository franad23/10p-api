import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let connectionPromise: ReturnType<typeof mongoose.connect> | null = null;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI no está configurada");

  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose;
}

export { connectDB };
