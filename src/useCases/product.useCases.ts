import { Product } from "../models/product.model";
import { productsServices } from "../services/product.service";

type PaginatedProducts = {
  results: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
};

const productUseCases = {
  list: async (
    page: number,
    limit: number,
    name?: string,
  ): Promise<PaginatedProducts> => {
    const { results, total } = await productsServices.list(
      page,
      limit,
      name,
    );
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return {
      results,
      total,
      totalPages,
      currentPage: page,
      limit,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };
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
