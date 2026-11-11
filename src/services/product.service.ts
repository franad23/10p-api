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
  list: async (
    page: number,
    limit: number,
    name?: string,
  ): Promise<{ results: Product[]; total: number }> => {
    const filter = name
      ? { name: { $regex: name, $options: "i" } }
      : {};
    const results = await ProductModel.find(filter)
      .populate("category_id", "name")
      .populate("createdBy_id", "name lastname")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await ProductModel.countDocuments(filter);
    return { results, total };
  },
  decreaseStock: async (items: Array<{ product_id: unknown; quantity: number }>) => {
    await ProductModel.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product_id },
          update: { $inc: { stock: -item.quantity } },
        },
      })),
    );
  },
  // deleteById: (id: number) => {
  //   const newData = productsData.filter((product) => product.id !== id);
  //   productsData = newData;
  // },
};

export { productsServices };
