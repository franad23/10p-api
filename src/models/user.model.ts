import { model, Schema } from "mongoose";

interface User {
  name: string;
  lastname: string;
  email: string;
  password: string;
  active: boolean;
}
const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const UserModel = model<User>("User", userSchema);
export type { User };
export { UserModel };
