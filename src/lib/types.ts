export const productCategories = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Beverages",
  "Snacks",
  "Groceries",
] as const;

export const paymentOptions = ["UPI", "Card", "Cash on Delivery"] as const;
export const orderStatuses = [
  "Placed",
  "Packing",
  "Out for Delivery",
  "Delivered",
] as const;

export type ProductCategory = (typeof productCategories)[number];
export type PaymentMethod = (typeof paymentOptions)[number];
export type OrderStatus = (typeof orderStatuses)[number];
export type UserRole = "customer" | "admin";

export type Product = {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  description: string;
  imageUrl: string;
  featured: number;
  inStock: number;
  createdAt: string;
  updatedAt: string;
};

export type CategorySummary = {
  name: ProductCategory;
  count: number;
  blurb: string;
  accent: string;
};

export type UserSummary = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type Address = {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes: string;
};

export type UserAccount = UserSummary & {
  address: Address | null;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
};

export type Order = {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  addressSnapshot: Address;
  items: OrderItem[];
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  address: Address | null;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  unit: string;
  imageUrl: string;
  category: ProductCategory;
  quantity: number;
};

export type OrderRequestItem = {
  productId: number;
  quantity: number;
};
