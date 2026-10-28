// import { Product, CURRENCY } from "../data/products";

import { CURRENCY, Product, ProductModel } from "../models/product.model";

const productsServices = {
  create: async (product: Product) => {
    await ProductModel.create(product);
  },
  getById: async (id: string): Promise<Product | null> => {
    return await ProductModel.findById(id);
  },
  update: async (id: string, product: Omit<Product, "createdBy_id">) => {
    await ProductModel.findByIdAndUpdate(id, product);
  },
  list: async (): Promise<Product[]> => {
    return await ProductModel.find()
      .populate("category_id", "name")
      .populate("createdBy_id", "name lastname");
  },
  // deleteById: (id: number) => {
  //   const newData = productsData.filter((product) => product.id !== id);
  //   productsData = newData;
  // },
};

export { productsServices };
