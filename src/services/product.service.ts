import { Product, CURRENCY } from "../data/products";

let productsData: Product[] = [
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
    stock: 0,
  },
];

const productsServices = {
  create: (product: Product) => {
    product.id = Math.round(Math.random() * 100);
    productsData.push(product);
  },
  getById: (id: number): Product | null => {
    const productFound = productsData.find((product) => product.id === id);
    if (!productFound) {
      return null;
    }
    return productFound;
  },
  list: (): Product[] => {
    return productsData;
  },
  deleteById: (id: number) => {
    const newData = productsData.filter((product) => product.id !== id);
    productsData = newData;
  },
};

export { productsServices };
