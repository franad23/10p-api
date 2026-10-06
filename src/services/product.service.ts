// import { Product, CURRENCY } from "../data/products";

import { CURRENCY, Product, ProductModel } from "../models/product.model";

const productsServices = {
  create: async (product: Product) => {
    await ProductModel.create(product);
  },
  getById: async (id: string): Promise<Product | null> => {
    return await ProductModel.findById(id);
  },
  update: async (id: string, product: Product) => {
    await ProductModel.findByIdAndUpdate(id, product);
  },
  // list: (): Product[] => {
  //   return productsData;
  // },
  // deleteById: (id: number) => {
  //   const newData = productsData.filter((product) => product.id !== id);
  //   productsData = newData;
  // },
};

export { productsServices };
