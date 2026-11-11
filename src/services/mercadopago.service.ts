const MP_API_URL = "https://api.mercadopago.com";

interface CheckoutOrder {
  id: string;
  currency: string;
  items: Array<{
    product_id: unknown;
    name: string;
    unit_price: number;
    quantity: number;
  }>;
}

interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
}

interface MercadoPagoPaymentSearch {
  results: MercadoPagoPayment[];
}

async function mpRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP-NOT-CONFIGURED");

  const response = await fetch(`${MP_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) throw new Error("MP-REQUEST-FAILED");
  return (await response.json()) as T;
}

const mercadoPagoServices = {
  createPreference: async (order: CheckoutOrder, payerEmail: string) => {
    const body: Record<string, unknown> = {
      items: order.items.map((item) => ({
        id: String(item.product_id),
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: order.currency,
      })),
      payer: { email: payerEmail },
      external_reference: order.id,
    };

    if (process.env.APP_URL) {
      body.back_urls = {
        success: `${process.env.APP_URL}/payment/success`,
        pending: `${process.env.APP_URL}/payment/pending`,
        failure: `${process.env.APP_URL}/payment/failure`,
      };
      body.auto_return = "approved";
    }

    return await mpRequest<MercadoPagoPreference>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  searchPayments: async (externalReference: string) => {
    const params = new URLSearchParams({
      external_reference: externalReference,
      sort: "date_created",
      criteria: "desc",
    });
    return await mpRequest<MercadoPagoPaymentSearch>(
      `/v1/payments/search?${params.toString()}`,
    );
  },
};

export { mercadoPagoServices };
