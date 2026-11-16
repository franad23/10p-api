import { Request, Response } from "express";
import { paymentUseCases } from "../useCases/payment.useCases";
import { mercadoPagoServices } from "../services/mercadopago.service";

const paymentControllers = {
  webhook: async (req: Request, res: Response) => {
    const dataIdQuery = req.query["data.id"];
    const dataId =
      typeof dataIdQuery === "string"
        ? dataIdQuery
        : typeof req.body?.data?.id === "string" ||
            typeof req.body?.data?.id === "number"
          ? String(req.body.data.id)
          : undefined;
    const notificationType =
      typeof req.query.type === "string" ? req.query.type : req.body?.type;
    const xSignature = req.header("x-signature");
    const xRequestId = req.header("x-request-id");

    if (notificationType !== "payment") {
      return res.status(200).json({ received: true, ignored: true });
    }
    if (!dataId || !xSignature || !xRequestId) {
      return res.status(400).json({ message: "Notificación incompleta" });
    }

    try {
      const validSignature = mercadoPagoServices.validateWebhookSignature(
        xSignature,
        xRequestId,
        dataId,
      );
      if (!validSignature) {
        return res.status(401).json({ message: "Firma inválida" });
      }

      const result = await paymentUseCases.processWebhook(dataId);
      return res.status(200).json({ received: true, ...result });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "MP-WEBHOOK-NOT-CONFIGURED"
      ) {
        return res.status(503).json({ message: "Webhook no configurado" });
      }
      if (
        error instanceof Error &&
        [
          "PAYMENT-WITHOUT-VALID-ORDER",
          "ORDER-NOT-FOUND",
          "PAYMENT-DATA-MISMATCH",
        ].includes(error.message)
      ) {
        return res
          .status(409)
          .json({ message: "El pago no coincide con una orden" });
      }
      return res.status(502).json({ message: "No se pudo procesar el pago" });
    }
  },
  success: (req: Request, res: Response) => {
    res.status(200).json({
      message: "Mercado Pago informó un pago exitoso",
      payment_id: req.query.payment_id,
      external_reference: req.query.external_reference,
      warning: "El estado definitivo se confirma mediante el Webhook",
    });
  },
  pending: (req: Request, res: Response) => {
    res.status(200).json({
      message: "El pago está pendiente",
      payment_id: req.query.payment_id,
      external_reference: req.query.external_reference,
    });
  },
  failure: (req: Request, res: Response) => {
    res.status(200).json({
      message: "El pago fue rechazado o cancelado",
      payment_id: req.query.payment_id,
      external_reference: req.query.external_reference,
    });
  },
  createCheckout: async (req: Request, res: Response) => {
    try {
      const checkout = await paymentUseCases.createCheckout(
        req.params.orderId as string,
        req.user!.id,
        req.user!.role,
        req.user!.email,
      );
      res.status(201).json(checkout);
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER-NOT-FOUND") {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      if (error instanceof Error && error.message === "ORDER-FORBIDDEN") {
        return res.status(403).json({ message: "No podés pagar esta orden" });
      }
      if (error instanceof Error && error.message === "ORDER-NOT-PENDING") {
        return res.status(400).json({ message: "La orden no está pendiente" });
      }
      if (error instanceof Error && error.message === "MP-NOT-CONFIGURED") {
        return res.status(500).json({ message: "Mercado Pago no configurado" });
      }
      return res.status(502).json({ message: "Error al crear el checkout" });
    }
  },
  sync: async (req: Request, res: Response) => {
    try {
      const order = await paymentUseCases.syncOrder(
        req.params.orderId as string,
        req.user!.id,
        req.user!.role,
      );
      res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error && error.message === "ORDER-NOT-FOUND") {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      if (error instanceof Error && error.message === "ORDER-FORBIDDEN") {
        return res.status(403).json({ message: "No podés consultar esta orden" });
      }
      if (
        error instanceof Error &&
        error.message === "APPROVED-PAYMENT-NOT-FOUND"
      ) {
        return res.status(409).json({
          message: "Mercado Pago todavía no registra un pago aprobado",
        });
      }
      if (error instanceof Error && error.message === "PAYMENT-DATA-MISMATCH") {
        return res.status(409).json({
          message: "Los datos del pago no coinciden con la orden",
        });
      }
      return res.status(502).json({ message: "No se pudo consultar Mercado Pago" });
    }
  },
};

export { paymentControllers };
