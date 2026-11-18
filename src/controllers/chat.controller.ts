import { Request, Response } from "express";
import { chatUseCases } from "../useCases/chat.useCases";

const chatControllers = {
  ask: async (req: Request, res: Response) => {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) {
      return res.status(400).json({ message: "La pregunta es obligatoria" });
    }
    if (message.length > 500) {
      return res.status(400).json({ message: "La pregunta no puede superar 500 caracteres" });
    }

    try {
      const answer = await chatUseCases.ask(message, {
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
      });
      return res.status(200).json({ answer });
    } catch (error) {
      if (error instanceof Error && error.message === "GROQ-NOT-CONFIGURED") {
        return res.status(503).json({ message: "El chatbot no está configurado" });
      }
      if (error instanceof Error && error.name === "TimeoutError") {
        return res.status(504).json({ message: "El chatbot tardó demasiado en responder" });
      }
      return res.status(502).json({ message: "No se pudo obtener una respuesta del chatbot" });
    }
  },
};

export { chatControllers };
