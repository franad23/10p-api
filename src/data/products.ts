interface Product {
  id: number;
  name: string;
  price: number;
  currency: CURRENCY;
  stock: number;
}

enum CURRENCY {
  ARS = "ARS",
  USD = "USD",
}

export { Product, CURRENCY };
