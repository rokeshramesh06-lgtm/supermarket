import { db } from "@/lib/db";
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

type AuthUserRow = UserSummary & {
  passwordHash: string;
};

type AddressRow = {
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes: string;
};

const categoryMeta: Record<ProductCategory, Omit<CategorySummary, "name" | "count">> = {
  Fruits: {
    blurb: "Seasonal sweetness and snackable freshness.",
    accent: "from-[#fff1d9] to-[#ffd9c3]",
  },
  Vegetables: {
    blurb: "Leafy greens and kitchen staples for daily cooking.",
    accent: "from-[#e5f3dd] to-[#cde7c7]",
  },
  Dairy: {
    blurb: "Milk, yogurt, and chilled comfort for every meal.",
    accent: "from-[#f6f0ff] to-[#e7e4ff]",
  },
  Beverages: {
    blurb: "Juices, brews, and ready-to-pour refreshers.",
    accent: "from-[#e7f6f3] to-[#d3edf0]",
  },
  Snacks: {
    blurb: "Crunchy, savoury, and energy-packed bites.",
    accent: "from-[#fff3df] to-[#ffe5ca]",
  },
  Groceries: {
    blurb: "Pantry foundations for everyday cooking.",
    accent: "from-[#efe6d8] to-[#deceb6]",
  },
};

function mapAddress(row?: AddressRow | null): Address | null {
  if (!row) {
    return null;
  }

  return {
    recipientName: row.recipientName,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    deliveryNotes: row.deliveryNotes,
  };
}

function parseAddressSnapshot(value: string): Address {
  return JSON.parse(value) as Address;
}

function getOrderItems(orderIds: number[]) {
  if (orderIds.length === 0) {
    return new Map<number, Order["items"]>();
  }

  const placeholders = orderIds.map(() => "?").join(", ");
  const rows = db
    .prepare(`
      SELECT
        id,
        order_id AS orderId,
        product_id AS productId,
        product_name AS productName,
        quantity,
        unit_price AS unitPrice,
        image_url AS imageUrl
      FROM order_items
      WHERE order_id IN (${placeholders})
      ORDER BY id ASC
    `)
    .all(...orderIds) as Order["items"];

  const itemsByOrder = new Map<number, Order["items"]>();

  for (const row of rows) {
    const list = itemsByOrder.get(row.orderId) ?? [];
    list.push(row);
    itemsByOrder.set(row.orderId, list);
  }

  return itemsByOrder;
}

function isCategory(value: string): value is ProductCategory {
  return productCategories.includes(value as ProductCategory);
}

function isOrderStatus(value: string): value is OrderStatus {
  return orderStatuses.includes(value as OrderStatus);
}

function getValidatedCategory(value: string) {
  if (!isCategory(value)) {
    throw new Error("Invalid category.");
  }

  return value;
}

export function getProducts(filters: { query?: string; category?: string } = {}) {
  const clauses: string[] = [];
  const values: string[] = [];

  if (filters.query) {
    const search = `%${filters.query}%`;
    clauses.push("(name LIKE ? OR description LIKE ? OR category LIKE ?)");
    values.push(search, search, search);
  }

  if (filters.category && isCategory(filters.category)) {
    clauses.push("category = ?");
    values.push(filters.category);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  return db
    .prepare(`
      SELECT
        id,
        name,
        category,
        price,
        unit,
        description,
        image_url AS imageUrl,
        featured,
        in_stock AS inStock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      ${where}
      ORDER BY featured DESC, name ASC
    `)
    .all(...values) as Product[];
}

export function getProductById(id: number) {
  return (
    (db
      .prepare(`
        SELECT
          id,
          name,
          category,
          price,
          unit,
          description,
          image_url AS imageUrl,
          featured,
          in_stock AS inStock,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM products
        WHERE id = ?
      `)
      .get(id) as Product | undefined) ?? null
  );
}

export function getCategorySummaries() {
  const rows = db
    .prepare(`
      SELECT category AS name, COUNT(*) AS count
      FROM products
      GROUP BY category
      ORDER BY category ASC
    `)
    .all() as Array<{ name: ProductCategory; count: number }>;

  const counts = new Map(rows.map((row) => [row.name, row.count]));

  return productCategories.map((name) => ({
    name,
    count: counts.get(name) ?? 0,
    blurb: categoryMeta[name].blurb,
    accent: categoryMeta[name].accent,
  }));
}

export function getUserByEmailForAuth(email: string) {
  return (
    (db
      .prepare(`
        SELECT
          id,
          name,
          email,
          role,
          created_at AS createdAt,
          password_hash AS passwordHash
        FROM users
        WHERE email = ?
      `)
      .get(email) as AuthUserRow | undefined) ?? null
  );
}

export function getUserById(id: number) {
  return (
    (db
      .prepare(`
        SELECT
          id,
          name,
          email,
          role,
          created_at AS createdAt
        FROM users
        WHERE id = ?
      `)
      .get(id) as UserSummary | undefined) ?? null
  );
}

export function createUserAccount(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const result = db
    .prepare(`
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES (?, ?, ?, 'customer', ?)
    `)
    .run(input.name, input.email, input.passwordHash, new Date().toISOString());

  return Number(result.lastInsertRowid);
}

export function getUserAccount(userId: number) {
  const user = getUserById(userId);

  if (!user) {
    return null;
  }

  const address = db
    .prepare(`
      SELECT
        recipient_name AS recipientName,
        phone,
        line1,
        line2,
        city,
        state,
        pincode,
        delivery_notes AS deliveryNotes
      FROM addresses
      WHERE user_id = ?
    `)
    .get(userId) as AddressRow | undefined;

  return {
    ...user,
    address: mapAddress(address),
  } satisfies UserAccount;
}

export function upsertAddress(userId: number, address: Address) {
  if (!address.recipientName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
    throw new Error("Complete the delivery address before saving.");
  }

  db.prepare(`
    INSERT INTO addresses (
      user_id,
      recipient_name,
      phone,
      line1,
      line2,
      city,
      state,
      pincode,
      delivery_notes,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      recipient_name = excluded.recipient_name,
      phone = excluded.phone,
      line1 = excluded.line1,
      line2 = excluded.line2,
      city = excluded.city,
      state = excluded.state,
      pincode = excluded.pincode,
      delivery_notes = excluded.delivery_notes,
      updated_at = excluded.updated_at
  `).run(
    userId,
    address.recipientName,
    address.phone,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.deliveryNotes,
    new Date().toISOString(),
  );
}

export function getOrdersForUser(userId: number) {
  const rows = db
    .prepare(`
      SELECT
        o.id,
        o.user_id AS userId,
        u.name AS customerName,
        u.email AS customerEmail,
        o.payment_method AS paymentMethod,
        o.status,
        o.subtotal,
        o.delivery_fee AS deliveryFee,
        o.total,
        o.created_at AS createdAt,
        o.address_snapshot AS addressSnapshot
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `)
    .all(userId) as Array<Omit<Order, "items" | "addressSnapshot"> & { addressSnapshot: string }>;

  const itemsByOrder = getOrderItems(rows.map((row) => row.id));

  return rows.map((row) => ({
    ...row,
    addressSnapshot: parseAddressSnapshot(row.addressSnapshot),
    items: itemsByOrder.get(row.id) ?? [],
  }));
}

export function getAllOrders() {
  const rows = db
    .prepare(`
      SELECT
        o.id,
        o.user_id AS userId,
        u.name AS customerName,
        u.email AS customerEmail,
        o.payment_method AS paymentMethod,
        o.status,
        o.subtotal,
        o.delivery_fee AS deliveryFee,
        o.total,
        o.created_at AS createdAt,
        o.address_snapshot AS addressSnapshot
      FROM orders o
      INNER JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `)
    .all() as Array<Omit<Order, "items" | "addressSnapshot"> & { addressSnapshot: string }>;

  const itemsByOrder = getOrderItems(rows.map((row) => row.id));

  return rows.map((row) => ({
    ...row,
    addressSnapshot: parseAddressSnapshot(row.addressSnapshot),
    items: itemsByOrder.get(row.id) ?? [],
  }));
}

export function getCustomers() {
  const rows = db
    .prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at AS createdAt,
        COUNT(o.id) AS totalOrders,
        COALESCE(SUM(o.total), 0) AS totalSpent,
        MAX(o.created_at) AS lastOrderAt,
        a.recipient_name AS recipientName,
        a.phone,
        a.line1,
        a.line2,
        a.city,
        a.state,
        a.pincode,
        a.delivery_notes AS deliveryNotes
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      LEFT JOIN addresses a ON a.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    .all() as Array<
      Customer & {
        recipientName?: string;
        phone?: string;
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        deliveryNotes?: string;
      }
    >;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
    totalOrders: row.totalOrders,
    totalSpent: row.totalSpent,
    lastOrderAt: row.lastOrderAt,
    address: row.recipientName
      ? mapAddress({
          recipientName: row.recipientName,
          phone: row.phone ?? "",
          line1: row.line1 ?? "",
          line2: row.line2 ?? "",
          city: row.city ?? "",
          state: row.state ?? "",
          pincode: row.pincode ?? "",
          deliveryNotes: row.deliveryNotes ?? "",
        })
      : null,
  }));
}

export function createOrder(input: {
  userId: number;
  items: OrderRequestItem[];
  paymentMethod: PaymentMethod;
  address: Address;
}) {
  const normalizedItems = input.items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Math.max(1, Math.min(Number(item.quantity), 20)),
    }))
    .filter((item) => Number.isFinite(item.productId) && Number.isFinite(item.quantity));

  if (normalizedItems.length === 0) {
    throw new Error("Add at least one product to the order.");
  }

  const placeholders = normalizedItems.map(() => "?").join(", ");
  const products = db
    .prepare(`
      SELECT
        id,
        name,
        category,
        price,
        unit,
        description,
        image_url AS imageUrl,
        featured,
        in_stock AS inStock,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM products
      WHERE id IN (${placeholders})
    `)
    .all(...normalizedItems.map((item) => item.productId)) as Product[];

  if (products.length !== normalizedItems.length) {
    throw new Error("Some products in the cart are no longer available.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  let subtotal = 0;

  const lineItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product || !product.inStock) {
      throw new Error("A product in the cart is out of stock.");
    }

    subtotal += product.price * item.quantity;

    return {
      ...item,
      name: product.name,
      unitPrice: product.price,
      imageUrl: product.imageUrl,
    };
  });

  const deliveryFee = subtotal >= 900 ? 0 : 60;
  const total = subtotal + deliveryFee;
  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    const orderResult = db
      .prepare(`
        INSERT INTO orders (
          user_id,
          address_snapshot,
          payment_method,
          status,
          subtotal,
          delivery_fee,
          total,
          created_at
        ) VALUES (?, ?, ?, 'Placed', ?, ?, ?, ?)
      `)
      .run(
        input.userId,
        JSON.stringify(input.address),
        input.paymentMethod,
        subtotal,
        deliveryFee,
        total,
        now,
      );

    const orderId = Number(orderResult.lastInsertRowid);
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        unit_price,
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const lineItem of lineItems) {
      insertItem.run(
        orderId,
        lineItem.productId,
        lineItem.name,
        lineItem.quantity,
        lineItem.unitPrice,
        lineItem.imageUrl,
      );
    }

    return orderId;
  });

  return transaction();
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
    db.prepare(`
      UPDATE products
      SET
        name = ?,
        category = ?,
        price = ?,
        unit = ?,
        description = ?,
        image_url = ?,
        featured = ?,
        in_stock = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      name,
      category,
      input.price,
      unit,
      description,
      imageUrl,
      input.featured ? 1 : 0,
      input.inStock ? 1 : 0,
      now,
      input.id,
    );

    return;
  }

  db.prepare(`
    INSERT INTO products (
      name,
      category,
      price,
      unit,
      description,
      image_url,
      featured,
      in_stock,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    category,
    input.price,
    unit,
    description,
    imageUrl,
    input.featured ? 1 : 0,
    input.inStock ? 1 : 0,
    now,
    now,
  );
}

export function updateOrderStatus(orderId: number, status: string) {
  if (!Number.isFinite(orderId)) {
    throw new Error("Invalid order selected.");
  }

  if (!isOrderStatus(status)) {
    throw new Error("Invalid order status.");
  }

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
}
