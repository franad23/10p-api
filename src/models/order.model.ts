import { model, Schema, Types } from "mongoose";
import { CURRENCY } from "./product.model";

enum ORDER_STATUS {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

interface OrderItem {
  product_id: Types.ObjectId;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  user_id: Types.ObjectId;
  items: OrderItem[];
  total: number;
  currency: CURRENCY;
  status: ORDER_STATUS;
  mercadopago_preference_id?: string;
  mercadopago_payment_id?: string;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<Order>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    currency: {
      type: String,
      enum: Object.values(CURRENCY),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      required: true,
    },
    mercadopago_preference_id: { type: String },
    mercadopago_payment_id: { type: String },
  },
  { timestamps: true },
);

const OrderModel = model<Order>("Order", orderSchema);

export type { Order, OrderItem };
export { ORDER_STATUS, OrderModel };
