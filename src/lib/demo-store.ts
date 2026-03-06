import bcrypt from "bcryptjs";
import {
  orderStatuses,
  productCategories,
  type Address,
  type CategorySummary,
  type Customer,
  type Order,
  type OrderRequestItem,
  type OrderStatus,
  type PaymentMethod,
  type Product,
  type ProductCategory,
  type UserAccount,
  type UserSummary,
} from "@/lib/types";
import { sanitizeText } from "@/lib/utils";

type AuthUserRow = UserSummary & { passwordHash: string };
type DemoState = {
  users: AuthUserRow[];
  products: Product[];
  addresses: Map<number, Address>;
  orders: Order[];
  nextUserId: number;
  nextProductId: number;
  nextOrderId: number;
  nextOrderItemId: number;
};

const categoryMeta: Record<ProductCategory, Omit<CategorySummary, "name" | "count">> = {
  Fruits: { blurb: "Seasonal sweetness and snackable freshness.", accent: "from-[#fff0ea] via-[#ffe2d7] to-[#ffd0bf]" },
  Vegetables: { blurb: "Leafy greens and kitchen staples for daily cooking.", accent: "from-[#e6faf2] via-[#d4f2e7] to-[#c2ebdb]" },
  Dairy: { blurb: "Milk, yogurt, and chilled comfort for every meal.", accent: "from-[#f4f2ff] via-[#eceafd] to-[#e4e2fb]" },
  Beverages: { blurb: "Juices, brews, and ready-to-pour refreshers.", accent: "from-[#e7f5ff] via-[#dceeff] to-[#cee5ff]" },
  Snacks: { blurb: "Crunchy, savoury, and energy-packed bites.", accent: "from-[#fff4de] via-[#ffeac8] to-[#ffdeb3]" },
  Groceries: { blurb: "Pantry foundations for everyday cooking.", accent: "from-[#f4eee7] via-[#ebe1d0] to-[#ddd0bb]" },
};

const sampleProducts = [
  ["Alphonso Mangoes", "Fruits", 249, "1 kg", "Sweet handpicked mangoes with rich aroma and golden pulp.", "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80", 1],
  ["Shimla Apples", "Fruits", 179, "1 kg", "Crisp Himalayan apples, perfect for healthy snacking.", "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=80", 1],
  ["Baby Spinach", "Vegetables", 89, "250 g", "Tender spinach leaves for salads, curries, and smoothies.", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80", 0],
  ["Cherry Tomatoes", "Vegetables", 119, "400 g", "Juicy cherry tomatoes with balanced sweetness and bite.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80", 1],
  ["A2 Farm Milk", "Dairy", 72, "1 L", "Fresh full-cream milk sourced from trusted local dairies.", "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80", 1],
  ["Greek Yogurt", "Dairy", 95, "400 g", "Thick and creamy yogurt ideal for breakfast bowls.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80", 0],
  ["Cold Brew Coffee", "Beverages", 149, "500 ml", "Smooth bottled cold brew with deep roasted notes.", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80", 0],
  ["Orange Juice", "Beverages", 110, "1 L", "No-added-sugar orange juice packed with citrus brightness.", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80", 1],
  ["Sea Salt Chips", "Snacks", 55, "150 g", "Thin-cut crispy chips seasoned with sea salt.", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=80", 0],
  ["Roasted Almonds", "Snacks", 185, "200 g", "Dry-roasted almonds for energy-rich everyday snacking.", "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=80", 1],
  ["Basmati Rice", "Groceries", 349, "5 kg", "Long-grain aromatic basmati rice for daily meals and biryani.", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80", 1],
  ["Whole Wheat Bread", "Groceries", 48, "400 g", "Soft and hearty loaf baked with whole wheat flour.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80", 0],
] as const;

const globalStore = globalThis as typeof globalThis & { __verduraDemoState__?: DemoState };

function isCategory(value: string): value is ProductCategory {
  return productCategories.includes(value as ProductCategory);
}

function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus);
}

function compareByName(left: { name: string }, right: { name: string }) {
  return left.name.localeCompare(right.name, "en");
}

function compareByCreatedAtDesc(left: { createdAt: string }, right: { createdAt: string }) {
  return right.createdAt.localeCompare(left.createdAt);
}

function cloneAddress(address: Address | null) {
  return address ? { ...address } : null;
}

function cloneProduct(product: Product) {
  return { ...product };
}

function cloneOrder(order: Order): Order {
  return { ...order, addressSnapshot: { ...order.addressSnapshot }, items: order.items.map((item) => ({ ...item })) };
}

function cloneUser(user: AuthUserRow): UserSummary {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function getValidatedCategory(value: string) {
  if (!isCategory(value)) {
    throw new Error("Invalid category.");
  }

  return value;
}

function createInitialState(): DemoState {
  const now = new Date().toISOString();
  const users: AuthUserRow[] = [
    { id: 1, name: "Admin", email: "admin@verdura.market", role: "admin", createdAt: now, passwordHash: bcrypt.hashSync("admin1234", 10) },
    { id: 2, name: "Customer Demo", email: "customer@verdura.market", role: "customer", createdAt: now, passwordHash: bcrypt.hashSync("shop1234", 10) },
  ];

  const products: Product[] = sampleProducts.map((product, index) => ({
    id: index + 1,
    name: product[0],
    category: product[1],
    price: product[2],
    unit: product[3],
    description: product[4],
    imageUrl: product[5],
    featured: product[6],
    inStock: 1,
    createdAt: now,
    updatedAt: now,
  }));

  const address: Address = {
    recipientName: "Customer Demo",
    phone: "9876543210",
    line1: "21 Green Avenue",
    line2: "Lake View Apartments",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    deliveryNotes: "Call when you arrive at the gate.",
  };

  let nextOrderItemId = 1;
  const orders: Order[] = [
    {
      id: 1,
      userId: 2,
      customerName: "Customer Demo",
      customerEmail: "customer@verdura.market",
      paymentMethod: "UPI",
      status: "Packing",
      subtotal: products[0].price * 2 + products[1].price,
      deliveryFee: 60,
      total: products[0].price * 2 + products[1].price + 60,
      createdAt: now,
      addressSnapshot: { ...address },
      items: [
        { id: nextOrderItemId++, orderId: 1, productId: products[0].id, productName: products[0].name, quantity: 2, unitPrice: products[0].price, imageUrl: products[0].imageUrl },
        { id: nextOrderItemId++, orderId: 1, productId: products[1].id, productName: products[1].name, quantity: 1, unitPrice: products[1].price, imageUrl: products[1].imageUrl },
      ],
    },
    {
      id: 2,
      userId: 2,
      customerName: "Customer Demo",
      customerEmail: "customer@verdura.market",
      paymentMethod: "Cash on Delivery",
      status: "Delivered",
      subtotal: products[2].price + products[3].price * 2,
      deliveryFee: 0,
      total: products[2].price + products[3].price * 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      addressSnapshot: { ...address },
      items: [
        { id: nextOrderItemId++, orderId: 2, productId: products[2].id, productName: products[2].name, quantity: 1, unitPrice: products[2].price, imageUrl: products[2].imageUrl },
        { id: nextOrderItemId++, orderId: 2, productId: products[3].id, productName: products[3].name, quantity: 2, unitPrice: products[3].price, imageUrl: products[3].imageUrl },
      ],
    },
  ];

  return {
    users,
    products,
    addresses: new Map([[2, address]]),
    orders,
    nextUserId: 3,
    nextProductId: products.length + 1,
    nextOrderId: orders.length + 1,
    nextOrderItemId,
  };
}

function getState() {
  if (!globalStore.__verduraDemoState__) {
    globalStore.__verduraDemoState__ = createInitialState();
  }

  return globalStore.__verduraDemoState__;
}

export function ensureSessionUser(user: UserSummary) {
  const state = getState();
  const existing = state.users.find((entry) => entry.id === user.id || entry.email === user.email);

  if (existing) {
    return cloneUser(existing);
  }

  state.users.push({ ...user, passwordHash: "" });
  state.nextUserId = Math.max(state.nextUserId, user.id + 1);
  return { ...user };
}

export function getProducts(filters: { query?: string; category?: string } = {}) {
  const state = getState();
  const query = sanitizeText(filters.query).toLowerCase();
  const category = sanitizeText(filters.category);

  return state.products
    .filter((product) => {
      if (query) {
        const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (category && isCategory(category) && product.category !== category) {
        return false;
      }

      return true;
    })
    .sort((left, right) => right.featured - left.featured || compareByName(left, right))
    .map(cloneProduct);
}

export function getProductById(id: number) {
  const product = getState().products.find((entry) => entry.id === id);
  return product ? cloneProduct(product) : null;
}

export function getCategorySummaries() {
  const counts = new Map<ProductCategory, number>();
  for (const product of getState().products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  return productCategories.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
    blurb: categoryMeta[name].blurb,
    accent: categoryMeta[name].accent,
  }));
}

export function getUserByEmailForAuth(email: string) {
  const user = getState().users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  return user ? { ...user } : null;
}

export function getUserById(id: number) {
  const user = getState().users.find((entry) => entry.id === id);
  return user ? cloneUser(user) : null;
}

export function createUserAccount(input: { name: string; email: string; passwordHash: string }) {
  const state = getState();
  const email = input.email.toLowerCase();

  if (state.users.some((user) => user.email.toLowerCase() === email)) {
    throw new Error("Email already exists.");
  }

  const userId = state.nextUserId++;
  state.users.push({
    id: userId,
    name: input.name,
    email,
    role: "customer",
    createdAt: new Date().toISOString(),
    passwordHash: input.passwordHash,
  });
  return userId;
}

export function getUserAccount(userId: number) {
  const user = getUserById(userId);
  if (!user) {
    return null;
  }

  return { ...user, address: cloneAddress(getState().addresses.get(userId) ?? null) } satisfies UserAccount;
}

export function upsertAddress(userId: number, address: Address) {
  if (!address.recipientName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
    throw new Error("Complete the delivery address before saving.");
  }

  getState().addresses.set(userId, { ...address });
}

export function getOrdersForUser(userId: number) {
  return getState().orders.filter((order) => order.userId === userId).sort(compareByCreatedAtDesc).map(cloneOrder);
}

export function getAllOrders() {
  return getState().orders.slice().sort(compareByCreatedAtDesc).map(cloneOrder);
}

export function getCustomers() {
  const state = getState();
  return state.users
    .filter((user) => user.role === "customer")
    .sort(compareByCreatedAtDesc)
    .map((user) => {
      const orders = state.orders.filter((order) => order.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
        lastOrderAt: orders.map((order) => order.createdAt).sort().at(-1) ?? null,
        address: cloneAddress(state.addresses.get(user.id) ?? null),
      } satisfies Customer;
    });
}

export function createOrder(input: { userId: number; items: OrderRequestItem[]; paymentMethod: PaymentMethod; address: Address }) {
  const state = getState();
  const user = state.users.find((entry) => entry.id === input.userId);
  if (!user) {
    throw new Error("Please sign in before placing an order.");
  }

  const normalizedItems = input.items
    .map((item) => ({ productId: Number(item.productId), quantity: Math.max(1, Math.min(Number(item.quantity), 20)) }))
    .filter((item) => Number.isFinite(item.productId) && Number.isFinite(item.quantity));

  if (normalizedItems.length === 0) {
    throw new Error("Add at least one product to the order.");
  }

  const productMap = new Map(state.products.map((product) => [product.id, product]));
  let subtotal = 0;
  const items = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("Some products in the cart are no longer available.");
    }
    if (!product.inStock) {
      throw new Error("A product in the cart is out of stock.");
    }
    subtotal += product.price * item.quantity;
    return { product, quantity: item.quantity };
  });

  const deliveryFee = subtotal >= 900 ? 0 : 60;
  const orderId = state.nextOrderId++;
  const order: Order = {
    id: orderId,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    paymentMethod: input.paymentMethod,
    status: "Placed",
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    createdAt: new Date().toISOString(),
    addressSnapshot: { ...input.address },
    items: items.map(({ product, quantity }) => ({
      id: state.nextOrderItemId++,
      orderId,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
    })),
  };

  state.orders.unshift(order);
  return orderId;
}

export function createOrUpdateProduct(input: {
  id?: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl: string;
  description: string;
  featured: boolean;
  inStock: boolean;
}) {
  const state = getState();
  const name = sanitizeText(input.name);
  const unit = sanitizeText(input.unit);
  const imageUrl = sanitizeText(input.imageUrl);
  const description = sanitizeText(input.description);
  const category = getValidatedCategory(input.category);

  if (!name || !unit || !imageUrl || !description || !Number.isFinite(input.price) || input.price <= 0) {
    throw new Error("Fill in all product fields before saving.");
  }

  const now = new Date().toISOString();
  if (input.id) {
    const product = state.products.find((entry) => entry.id === input.id);
    if (!product) {
      throw new Error("Product not found.");
    }

    product.name = name;
    product.category = category;
    product.price = input.price;
    product.unit = unit;
    product.description = description;
    product.imageUrl = imageUrl;
    product.featured = input.featured ? 1 : 0;
    product.inStock = input.inStock ? 1 : 0;
    product.updatedAt = now;
    return;
  }

  state.products.push({
    id: state.nextProductId++,
    name,
    category,
    price: input.price,
    unit,
    description,
    imageUrl,
    featured: input.featured ? 1 : 0,
    inStock: input.inStock ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  });
}

export function updateOrderStatus(orderId: number, status: string) {
  if (!Number.isFinite(orderId)) {
    throw new Error("Invalid order selected.");
  }
  if (!isOrderStatus(status)) {
    throw new Error("Invalid order status.");
  }

  const order = getState().orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  order.status = status;
}
