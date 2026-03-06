import { createRequire } from "node:module";
import * as demoStore from "@/lib/demo-store";

const isVercel = Boolean(process.env.VERCEL);
const require = createRequire(import.meta.url);
const sqliteData = isVercel ? null : (require("./data-sqlite") as typeof import("./data-sqlite"));
const dataStore = isVercel ? demoStore : sqliteData;

if (!dataStore) {
  throw new Error("Data store failed to initialize.");
}

export const getProducts = dataStore.getProducts;
export const getProductById = dataStore.getProductById;
export const getCategorySummaries = dataStore.getCategorySummaries;
export const getUserByEmailForAuth = dataStore.getUserByEmailForAuth;
export const getUserById = dataStore.getUserById;
export const createUserAccount = dataStore.createUserAccount;
export const getUserAccount = dataStore.getUserAccount;
export const upsertAddress = dataStore.upsertAddress;
export const getOrdersForUser = dataStore.getOrdersForUser;
export const getAllOrders = dataStore.getAllOrders;
export const getCustomers = dataStore.getCustomers;
export const createOrder = dataStore.createOrder;
export const createOrUpdateProduct = dataStore.createOrUpdateProduct;
export const updateOrderStatus = dataStore.updateOrderStatus;
