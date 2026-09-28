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

const productsData: Product[] = [
  {
    id: 1,
    name: "Remera mangas cortas",
    currency: CURRENCY.ARS,
    price: 1000,
    stock: 100,
  },
  {
    id: 2,
    name: "Pantalon largo",
    currency: CURRENCY.USD,
    price: 100,
    stock: 100,
  },
];

export type { Product };
export { productsData };
