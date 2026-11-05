import { cloudinary } from "../config/cloudinary";
import { ProductImage } from "../models/product.model";

const cloudinaryService = {
  uploadImage: (buffer: Buffer): Promise<ProductImage> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error("CLOUDINARY-UPLOAD-FAILED"));
          }
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      uploadStream.end(buffer);
    });
  },
};

export { cloudinaryService };
