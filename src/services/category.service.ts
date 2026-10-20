import { Category, CategoryModel } from "../models/category.model";

const categoriesServices = {
  create: async (category: Category) => {
    await CategoryModel.create(category);
  },
  getById: async (id: string): Promise<Category | null> => {
    return await CategoryModel.findById(id);
  },
  findByName: async (name: string): Promise<Category | null> => {
    const categoryFound = await CategoryModel.findOne({
      name,
    });
    return categoryFound;
  },
  update: async (id: string, category: Category) => {
    await CategoryModel.findByIdAndUpdate(id, category);
  },
  list: async (): Promise<Category[]> => {
    return await CategoryModel.find();
  },
  deleteById: async (id: string) => {
    await CategoryModel.findByIdAndDelete(id);
  },
};

export { categoriesServices };
