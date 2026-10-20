import { model, Schema } from "mongoose";

interface Category {
  name: string;
  description: string;
  active: boolean;
}

const categorySchema = new Schema<Category>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CategoryModel = model<Category>("Category", categorySchema);

export type { Category };
export { CategoryModel };
