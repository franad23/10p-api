import { ORDER_STATUS } from "../models/order.model";
import { USER_ROLE } from "../models/user.model";
import { mercadoPagoServices } from "../services/mercadopago.service";
import { orderServices } from "../services/order.service";
import { productsServices } from "../services/product.service";
import { isValidObjectId } from "mongoose";

function getOwnerId(userId: unknown) {
  if (typeof userId === "object" && userId && "_id" in userId) {
    return String(userId._id);
  }
  return String(userId);
}

const paymentUseCases = {
  createCheckout: async (
    orderId: string,
    userId: string,
    userRole: USER_ROLE,
    userEmail: string,
  ) => {
    const order = await orderServices.getById(orderId);
    if (!order) throw new Error("ORDER-NOT-FOUND");
    if (userRole !== USER_ROLE.ADMIN && getOwnerId(order.user_id) !== userId) {
      throw new Error("ORDER-FORBIDDEN");
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new Error("ORDER-NOT-PENDING");
    }

    const preference = await mercadoPagoServices.createPreference(
      {
        id: String(order._id),
        currency: order.currency,
        items: order.items,
      },
      userEmail,
    );
    await orderServices.savePreference(String(order._id), preference.id);

    return {
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    };
  },
  syncOrder: async (orderId: string, userId: string, userRole: USER_ROLE) => {
    const order = await orderServices.getById(orderId);
    if (!order) throw new Error("ORDER-NOT-FOUND");
    if (userRole !== USER_ROLE.ADMIN && getOwnerId(order.user_id) !== userId) {
      throw new Error("ORDER-FORBIDDEN");
    }
    if (order.status === ORDER_STATUS.PAID) return order;

    const search = await mercadoPagoServices.searchPayments(orderId);
    const payment = search.results.find(
      (result) =>
        result.status === "approved" && result.external_reference === orderId,
    );
    if (!payment) throw new Error("APPROVED-PAYMENT-NOT-FOUND");
    if (
      order.total !== payment.transaction_amount ||
      order.currency !== payment.currency_id
    ) {
      throw new Error("PAYMENT-DATA-MISMATCH");
    }

    const paidOrder = await orderServices.markAsPaid(
      String(order._id),
      String(payment.id),
    );
    if (paidOrder) await productsServices.decreaseStock(paidOrder.items);
    return paidOrder;
  },
  processWebhook: async (paymentId: string) => {
    const payment = await mercadoPagoServices.getPayment(paymentId);

    if (payment.status !== "approved") {
      return { processed: false, status: payment.status };
    }

    const orderId = payment.external_reference;
    if (!orderId || !isValidObjectId(orderId)) {
      throw new Error("PAYMENT-WITHOUT-VALID-ORDER");
    }

    const order = await orderServices.getById(orderId);
    if (!order) throw new Error("ORDER-NOT-FOUND");
    if (
      order.total !== payment.transaction_amount ||
      order.currency !== payment.currency_id
    ) {
      throw new Error("PAYMENT-DATA-MISMATCH");
    }

    if (order.status === ORDER_STATUS.PAID) {
      return { processed: false, status: payment.status };
    }

    const paidOrder = await orderServices.markAsPaid(
      String(order._id),
      String(payment.id),
    );
    if (!paidOrder) return { processed: false, status: payment.status };

    await productsServices.decreaseStock(paidOrder.items);
    return { processed: true, status: payment.status };
  },
};

export { paymentUseCases };
