import { model, Schema } from "mongoose";

interface Product {
  name: string;
  price: number;
  currency: CURRENCY;
  stock: number;
  active: boolean;
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
  },
  {
    timestamps: true,
  },
);

const ProductModel = model<Product>("Product", productSchema);

export type { Product, CURRENCY };
export { ProductModel };
