import { Product } from "../data/products";
import { productsServices } from "../services/product.service";

const productUseCases = {
  list: (): Product[] => {
    return productsServices.list();
  },
  getById: (id: number): Product => {
    const productFound = productsServices.getById(id);
    if (!productFound) {
      throw new Error("PRODUCT-NOT-FOUND");
    }
    return productFound;
  },
  create: (product: Product) => {
    productsServices.create(product);
  },
  deleteById: (id: number) => {
    const productFound = productsServices.getById(id);
    if (!productFound) {
      throw new Error("PRODUCT-NOT-FOUND");
    }
    if (productFound.stock) {
      throw new Error("PRODUCT-STOCKED");
    }
    productsServices.deleteById(id);
  },
};

export { productUseCases };
