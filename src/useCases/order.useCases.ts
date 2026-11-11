import { isValidObjectId, Types } from "mongoose";
import { ORDER_STATUS, OrderItem } from "../models/order.model";
import { USER_ROLE } from "../models/user.model";
import { productsServices } from "../services/product.service";
import { orderServices } from "../services/order.service";

interface NewOrderItem {
  product_id: string;
  quantity: number;
}

const orderUseCases = {
  create: async (userId: string, requestedItems: NewOrderItem[]) => {
    const items: OrderItem[] = [];
    let currency;

    for (const requestedItem of requestedItems) {
      const product = await productsServices.getById(requestedItem.product_id);
      if (!product || !product.active) throw new Error("PRODUCT-NOT-AVAILABLE");
      if (requestedItem.quantity > product.stock) {
        throw new Error("INSUFFICIENT-STOCK");
      }
      if (currency && currency !== product.currency) {
        throw new Error("MIXED-CURRENCIES");
      }
      currency = product.currency;

      items.push({
        product_id: new Types.ObjectId(requestedItem.product_id),
        name: product.name,
        unit_price: product.price,
        quantity: requestedItem.quantity,
        subtotal: product.price * requestedItem.quantity,
      });
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return await orderServices.create({
      user_id: new Types.ObjectId(userId),
      items,
      total,
      currency: currency!,
      status: ORDER_STATUS.PENDING,
    });
  },
  listMine: async (userId: string) => {
    return await orderServices.listByUser(userId);
  },
  list: async () => {
    return await orderServices.list();
  },
  getById: async (id: string, userId: string, role: USER_ROLE) => {
    if (!isValidObjectId(id)) throw new Error("ORDER-NOT-FOUND");
    const order = await orderServices.getById(id);
    if (!order) throw new Error("ORDER-NOT-FOUND");

    const ownerId =
      typeof order.user_id === "object" && "_id" in order.user_id
        ? String(order.user_id._id)
        : String(order.user_id);
    if (role !== USER_ROLE.ADMIN && ownerId !== userId) {
      throw new Error("ORDER-FORBIDDEN");
    }
    return order;
  },
};

export { orderUseCases };
