import { Product, productsData } from "../data/products";

const productsServices = {
  create: (product: Product) => {
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
    productsData.filter((product) => product.id !== id);
  },
};

export { productsServices };
