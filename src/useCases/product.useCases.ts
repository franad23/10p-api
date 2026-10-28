import { Product } from "../models/product.model";
import { productsServices } from "../services/product.service";

const productUseCases = {
  list: async (): Promise<Product[]> => {
    return await productsServices.list();
  },
  getById: async (id: string): Promise<Product> => {
    const productFound = await productsServices.getById(id);
    if (!productFound) {
      throw new Error("PRODUCT-NOT-FOUND");
    }
    return productFound;
  },
  create: async (product: Product) => {
    await productsServices.create(product);
  },
  update: async (id: string, product: Omit<Product, "createdBy_id">) => {
    await productsServices.update(id, product);
  },
  // deleteById: (id: number) => {
  //   const productFound = productsServices.getById(id);
  //   if (!productFound) {
  //     throw new Error("PRODUCT-NOT-FOUND");
  //   }
  //   if (productFound.stock) {
  //     throw new Error("PRODUCT-STOCKED");
  //   }
  //   productsServices.deleteById(id);
  // },
};

export { productUseCases };
