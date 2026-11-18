import { QueryFilter, Types } from "mongoose";
import { CategoryModel } from "../models/category.model";
import { ORDER_STATUS, Order, OrderModel } from "../models/order.model";
import { CURRENCY, Product, ProductModel } from "../models/product.model";
import { USER_ROLE, UserModel } from "../models/user.model";
import { groqServices, ToolDefinition } from "../services/groq.service";
import { orderUseCases } from "./order.useCases";
import { paymentUseCases } from "./payment.useCases";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

function regex(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function limit(value: unknown) {
  return Math.min(Math.max(Number(value) || 5, 1), 20);
}

const commonTools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "buscar_productos",
      description: "Busca, filtra y ordena productos activos del catálogo.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          categoria: { type: "string" },
          moneda: { type: "string", enum: ["ARS", "USD"] },
          con_stock: { type: "boolean" },
          orden_precio: { type: "string", enum: ["asc", "desc"] },
          limite: { type: "integer", minimum: 1, maximum: 20 },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_categorias",
      description: "Lista las categorías activas disponibles.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

const myOrdersTool: ToolDefinition = {
  type: "function",
  function: {
    name: "consultar_mis_ordenes",
    description: "Consulta únicamente las órdenes del cliente autenticado y su estado de pago.",
    parameters: {
      type: "object",
      properties: {
        producto: { type: "string" },
        estado: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] },
        limite: { type: "integer", minimum: 1, maximum: 20 },
      },
      additionalProperties: false,
    },
  },
};

const adminOrdersTool: ToolDefinition = {
  type: "function",
  function: {
    name: "consultar_ordenes",
    description: "Consulta órdenes de clientes y su estado de pago. Disponible solo para administradores.",
    parameters: {
      type: "object",
      properties: {
        cliente: { type: "string", description: "Nombre, apellido o email" },
        producto: { type: "string" },
        estado: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] },
        limite: { type: "integer", minimum: 1, maximum: 20 },
      },
      additionalProperties: false,
    },
  },
};

const buyProductTool: ToolDefinition = {
  type: "function",
  function: {
    name: "comprar_producto",
    description:
      "Crea una orden de compra para el cliente autenticado con un producto del catálogo y genera el link de pago de Mercado Pago. Disponible solo para clientes.",
    parameters: {
      type: "object",
      properties: {
        producto: { type: "string", description: "Nombre (o parte del nombre) del producto a comprar" },
        cantidad: { type: "integer", minimum: 1, description: "Cantidad a comprar, por defecto 1" },
      },
      required: ["producto"],
      additionalProperties: false,
    },
  },
};

const createProductTool: ToolDefinition = {
  type: "function",
  function: {
    name: "crear_producto",
    description:
      "Crea un nuevo producto en el catálogo. Disponible solo para administradores. La imagen es opcional, el producto se puede crear sin ella.",
    parameters: {
      type: "object",
      properties: {
        nombre: { type: "string" },
        precio: { type: "number" },
        moneda: { type: "string", enum: ["ARS", "USD"] },
        stock: { type: "integer", minimum: 0 },
        categoria: { type: "string", description: "Nombre de la categoría existente" },
        activo: { type: "boolean", description: "Si el producto queda visible en la tienda. Por defecto true." },
      },
      required: ["nombre", "precio", "moneda", "stock", "categoria"],
      additionalProperties: false,
    },
  },
};

async function searchProducts(args: Record<string, unknown>) {
  const filter: QueryFilter<Product> = { active: true };
  const name = text(args.nombre);
  const category = text(args.categoria);
  if (name) filter.name = regex(name);
  if (args.moneda === CURRENCY.ARS || args.moneda === CURRENCY.USD) filter.currency = args.moneda;
  if (args.con_stock === true) filter.stock = { $gt: 0 };
  if (category) {
    const categories = await CategoryModel.find({ name: regex(category), active: true }).select("_id");
    filter.category_id = { $in: categories.map((item) => item._id) };
  }
  const sort = args.orden_precio === "desc" ? -1 : 1;
  return await ProductModel.find(filter)
    .select("name price currency stock category_id")
    .populate("category_id", "name")
    .sort({ price: sort })
    .limit(limit(args.limite))
    .lean();
}

async function listCategories() {
  return await CategoryModel.find({ active: true })
    .select("name description")
    .sort({ name: 1 })
    .lean();
}

async function findOrders(args: Record<string, unknown>, userId?: string) {
  const filter: QueryFilter<Order> = {};
  if (userId) filter.user_id = new Types.ObjectId(userId);
  const status = text(args.estado);
  if (status && Object.values(ORDER_STATUS).includes(status as ORDER_STATUS)) {
    filter.status = status as ORDER_STATUS;
  }
  const product = text(args.producto);
  if (product) filter["items.name"] = regex(product);

  const client = text(args.cliente);
  if (client && !userId) {
    const users = await UserModel.find({
      $or: [{ name: regex(client) }, { lastname: regex(client) }, { email: regex(client) }],
    }).select("_id");
    filter.user_id = { $in: users.map((user) => user._id) };
  }

  return await OrderModel.find(filter)
    .select("user_id items total currency status mercadopago_payment_id createdAt")
    .populate("user_id", "name lastname email")
    .sort({ createdAt: -1 })
    .limit(limit(args.limite))
    .lean();
}

async function buyProduct(
  args: Record<string, unknown>,
  user: { id: string; email: string },
) {
  const name = text(args.producto);
  if (!name) return { error: "Indicá qué producto querés comprar" };

  const quantity = Math.max(Math.trunc(Number(args.cantidad) || 1), 1);

  const matches = await ProductModel.find({ name: regex(name), active: true })
    .select("name price currency stock")
    .limit(5)
    .lean();

  if (matches.length === 0) {
    return { error: `No encontré ningún producto activo que coincida con "${name}"` };
  }
  if (matches.length > 1) {
    return {
      error: "Hay más de un producto que coincide, pedile al usuario que precise cuál quiere",
      opciones: matches.map((item) => ({ nombre: item.name, precio: item.price, moneda: item.currency })),
    };
  }

  const product = matches[0];
  if (quantity > product.stock) {
    return { error: `No hay stock suficiente de "${product.name}" (disponible: ${product.stock})` };
  }

  try {
    const order = await orderUseCases.create(user.id, [
      { product_id: String(product._id), quantity },
    ]);

    const checkout = await paymentUseCases.createCheckout(
      String(order._id),
      user.id,
      USER_ROLE.CLIENT,
      user.email,
    );

    return {
      orden_id: order._id,
      producto: product.name,
      cantidad: quantity,
      total: order.total,
      moneda: order.currency,
      link_pago: checkout.init_point,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT-STOCK") {
      return { error: `No hay stock suficiente de "${product.name}"` };
    }
    if (error instanceof Error && error.message === "MP-NOT-CONFIGURED") {
      return { error: "Mercado Pago no está configurado, no se puede generar el link de pago" };
    }
    return { error: "No se pudo generar la orden de compra, intentá de nuevo" };
  }
}

async function createProduct(args: Record<string, unknown>, createdBy: string) {
  const name = text(args.nombre);
  const categoryName = text(args.categoria);
  const price = Number(args.precio);
  const stock = Number(args.stock);

  if (!name) return { error: "El nombre del producto es obligatorio" };
  if (args.moneda !== CURRENCY.ARS && args.moneda !== CURRENCY.USD) {
    return { error: "La moneda debe ser ARS o USD" };
  }
  if (!Number.isFinite(price) || price <= 0) return { error: "El precio debe ser un número mayor a 0" };
  if (!Number.isFinite(stock) || stock < 0) return { error: "El stock debe ser un número mayor o igual a 0" };
  if (!categoryName) return { error: "La categoría es obligatoria" };

  const category = await CategoryModel.findOne({ name: regex(categoryName), active: true }).select("_id name");
  if (!category) return { error: `No existe una categoría activa llamada "${categoryName}"` };

  const product = await ProductModel.create({
    name,
    price,
    currency: args.moneda,
    stock,
    active: args.activo !== false,
    category_id: category._id,
    createdBy_id: new Types.ObjectId(createdBy),
  });

  return {
    success: true,
    product: {
      id: product._id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      stock: product.stock,
      active: product.active,
      categoria: category.name,
    },
  };
}

const chatUseCases = {
  ask: async (message: string, user: { id: string; email: string; role: USER_ROLE }) => {
    const tools = [
      ...commonTools,
      user.role === USER_ROLE.ADMIN ? adminOrdersTool : myOrdersTool,
      ...(user.role === USER_ROLE.ADMIN ? [createProductTool] : [buyProductTool]),
    ];

    return await groqServices.askWithTools(message, user.role, tools, async (name, args) => {
      if (name === "buscar_productos") return await searchProducts(args);
      if (name === "listar_categorias") return await listCategories();
      if (name === "consultar_mis_ordenes" && user.role === USER_ROLE.CLIENT) {
        return await findOrders(args, user.id);
      }
      if (name === "consultar_ordenes" && user.role === USER_ROLE.ADMIN) {
        return await findOrders(args);
      }
      if (name === "crear_producto" && user.role === USER_ROLE.ADMIN) {
        return await createProduct(args, user.id);
      }
      if (name === "comprar_producto" && user.role === USER_ROLE.CLIENT) {
        return await buyProduct(args, user);
      }
      throw new Error("TOOL-NOT-ALLOWED");
    });
  },
};

export { chatUseCases };
