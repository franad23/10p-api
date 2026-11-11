import { HydratedDocument, QueryFilter, Types } from "mongoose";
import { ORDER_STATUS, Order, OrderModel } from "../models/order.model";

const orderServices = {
  create: async (order: Order) => {
    return await OrderModel.create(order);
  },
  listByUser: async (userId: string) => {
    return await OrderModel.find({ user_id: userId }).sort({ createdAt: -1 });
  },
  list: async () => {
    return await OrderModel.find()
      .populate("user_id", "name lastname email")
      .sort({ createdAt: -1 });
  },
  getById: async (id: string) => {
    return await OrderModel.findById(id).populate(
      "user_id",
      "name lastname email",
    );
  },
  savePreference: async (id: string, preferenceId: string) => {
    return await OrderModel.findByIdAndUpdate(
      id,
      { mercadopago_preference_id: preferenceId },
      { new: true },
    );
  },
  markAsPaid: async (
    id: string,
    paymentId: string,
  ): Promise<HydratedDocument<Order> | null> => {
    const filter: QueryFilter<Order> = {
      _id: new Types.ObjectId(id),
      status: ORDER_STATUS.PENDING,
    };
    return await OrderModel.findOneAndUpdate(
      filter,
      {
        status: ORDER_STATUS.PAID,
        mercadopago_payment_id: paymentId,
      },
      { new: true },
    );
  },
};

export { orderServices };
