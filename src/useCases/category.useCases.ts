import { Category } from "../models/category.model";
import { categoriesServices } from "../services/category.service";

const categoryUseCases = {
  list: async (): Promise<Category[]> => {
    return await categoriesServices.list();
  },
  getById: async (id: string): Promise<Category> => {
    const categoryFound = await categoriesServices.getById(id);
    if (!categoryFound) {
      throw new Error("CATEGORY-NOT-FOUND");
    }
    return categoryFound;
  },
  create: async (category: Category) => {
    const categoryExists = await categoriesServices.findByName(category.name);
    if (categoryExists) {
      throw new Error("CATEGORY-ALREADY-EXISTS");
    }
    await categoriesServices.create(category);
  },
  update: async (id: string, category: Category) => {
    const categoryFound = await categoriesServices.getById(id);
    if (!categoryFound) {
      throw new Error("CATEGORY-NOT-FOUND");
    }
    await categoriesServices.update(id, category);
  },
  deleteById: async (id: string) => {
    const categoryFound = await categoriesServices.getById(id);
    if (!categoryFound) {
      throw new Error("CATEGORY-NOT-FOUND");
    }
    await categoriesServices.deleteById(id);
  },
};

export { categoryUseCases };
