import { model, Schema } from "mongoose";

enum USER_ROLE {
  ADMIN = "ADMIN",
  CLIENT = "CLIENT",
}

interface User {
  name: string;
  lastname: string;
  email: string;
  password: string;
  active: boolean;
  role: USER_ROLE;
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
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true,
      default: USER_ROLE.CLIENT,
    },
  },
  { timestamps: true },
);

const UserModel = model<User>("User", userSchema);
export type { User };
export { USER_ROLE, UserModel };
