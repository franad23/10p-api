import { model, Schema, Types } from "mongoose";

interface ProductImage {
  url: string;
  public_id: string;
}

interface Product {
  name: string;
  price: number;
  currency: CURRENCY;
  stock: number;
  active: boolean;
  category_id: Types.ObjectId;
  createdBy_id: Types.ObjectId;
  image?: ProductImage;
}

enum CURRENCY {
  ARS = "ARS",
  USD = "USD",
}

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCY),
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    createdBy_id: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    image: {
      type: {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const ProductModel = model<Product>("Product", productSchema);

export type { Product, ProductImage };
export { CURRENCY, ProductModel };
