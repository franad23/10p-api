import app from "./app";
import { connectDB } from "./config/connectDb";

const port = Number(process.env.PORT) || 3001;

async function startServer() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server corriendo en el puerto ${port}`);
  });
}

startServer().catch((error) => {
  console.error("No se pudo iniciar el servidor", error);
  process.exit(1);
});
