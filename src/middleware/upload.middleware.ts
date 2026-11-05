import multer from "multer";
import { NextFunction, Request, Response } from "express";

const storage = multer.memoryStorage();

const uploadSingleImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("INVALID-FILE-TYPE"));
    }
    cb(null, true);
  },
}).single("image");

function uploadProductImage(req: Request, res: Response, next: NextFunction) {
  uploadSingleImage(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: "Error al subir la imagen" });
    }
    if (error) {
      return res.status(400).json({ message: "El archivo debe ser una imagen" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "La imagen del producto es obligatoria" });
    }
    next();
  });
}

export { uploadProductImage };
