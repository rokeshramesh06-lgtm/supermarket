import { mkdirSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const dataDirectory = join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

const db = new Database(join(dataDirectory, "supermarket.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    delivery_notes TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    unit TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    in_stock INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address_snapshot TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL,
    total REAL NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_unique
  ON products (name);
`);

const now = new Date().toISOString();

const sampleProducts = [
  {
    name: "Alphonso Mangoes",
    category: "Fruits",
    price: 249,
    unit: "1 kg",
    description: "Sweet handpicked mangoes with rich aroma and golden pulp.",
    imageUrl:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Shimla Apples",
    category: "Fruits",
    price: 179,
    unit: "1 kg",
    description: "Crisp Himalayan apples, perfect for healthy snacking.",
    imageUrl:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Baby Spinach",
    category: "Vegetables",
    price: 89,
    unit: "250 g",
    description: "Tender spinach leaves for salads, curries, and smoothies.",
    imageUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1200&q=80",
    featured: 0,
  },
  {
    name: "Cherry Tomatoes",
    category: "Vegetables",
    price: 119,
    unit: "400 g",
    description: "Juicy cherry tomatoes with balanced sweetness and bite.",
    imageUrl:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "A2 Farm Milk",
    category: "Dairy",
    price: 72,
    unit: "1 L",
    description: "Fresh full-cream milk sourced from trusted local dairies.",
    imageUrl:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Greek Yogurt",
    category: "Dairy",
    price: 95,
    unit: "400 g",
    description: "Thick and creamy yogurt ideal for breakfast bowls.",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
    featured: 0,
  },
  {
    name: "Cold Brew Coffee",
    category: "Beverages",
    price: 149,
    unit: "500 ml",
    description: "Smooth bottled cold brew with deep roasted notes.",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    featured: 0,
  },
  {
    name: "Orange Juice",
    category: "Beverages",
    price: 110,
    unit: "1 L",
    description: "No-added-sugar orange juice packed with citrus brightness.",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Sea Salt Chips",
    category: "Snacks",
    price: 55,
    unit: "150 g",
    description: "Thin-cut crispy chips seasoned with sea salt.",
    imageUrl:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=1200&q=80",
    featured: 0,
  },
  {
    name: "Roasted Almonds",
    category: "Snacks",
    price: 185,
    unit: "200 g",
    description: "Dry-roasted almonds for energy-rich everyday snacking.",
    imageUrl:
      "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Basmati Rice",
    category: "Groceries",
    price: 349,
    unit: "5 kg",
    description: "Long-grain aromatic basmati rice for daily meals and biryani.",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    featured: 1,
  },
  {
    name: "Whole Wheat Bread",
    category: "Groceries",
    price: 48,
    unit: "400 g",
    description: "Soft and hearty loaf baked with whole wheat flour.",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    featured: 0,
  },
] as const;

function reserveSeed(key: string) {
  const result = db
    .prepare("INSERT OR IGNORE INTO app_meta (key, value) VALUES (?, ?)")
    .run(key, new Date().toISOString());

  return result.changes > 0;
}

function seedUsers() {
  if (!reserveSeed("seed_users_v1")) {
    return;
  }

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run(
    "Admin",
    "admin@verdura.market",
    bcrypt.hashSync("admin1234", 10),
    "admin",
    now,
  );

  insertUser.run(
    "Customer Demo",
    "customer@verdura.market",
    bcrypt.hashSync("shop1234", 10),
    "customer",
    now,
  );
}

function seedProducts() {
  if (!reserveSeed("seed_products_v1")) {
    return;
  }

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);

  for (const product of sampleProducts) {
    insertProduct.run(
      product.name,
      product.category,
      product.price,
      product.unit,
      product.description,
      product.imageUrl,
      product.featured,
      now,
      now,
    );
  }
}

function seedAddressAndOrders() {
  if (!reserveSeed("seed_customer_content_v1")) {
    return;
  }

  const customer = db.prepare("SELECT id FROM users WHERE email = ?").get("customer@verdura.market") as
    | { id: number }
    | undefined;

  if (!customer) {
    return;
  }

  const addressExists = db.prepare("SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?").get(customer.id) as {
    count: number;
  };

  if (addressExists.count === 0) {
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
    `).run(
      customer.id,
      "Customer Demo",
      "9876543210",
      "21 Green Avenue",
      "Lake View Apartments",
      "Bengaluru",
      "Karnataka",
      "560001",
      "Call when you arrive at the gate.",
      now,
    );
  }

  const ordersExist = db.prepare("SELECT COUNT(*) AS count FROM orders").get() as { count: number };

  if (ordersExist.count > 0) {
    return;
  }

  const productRows = db
    .prepare("SELECT id, name, price, image_url AS imageUrl FROM products ORDER BY id LIMIT 4")
    .all() as Array<{ id: number; name: string; price: number; imageUrl: string }>;

  if (productRows.length < 2) {
    return;
  }

  const addressSnapshot = JSON.stringify({
    recipientName: "Customer Demo",
    phone: "9876543210",
    line1: "21 Green Avenue",
    line2: "Lake View Apartments",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    deliveryNotes: "Call when you arrive at the gate.",
  });

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      user_id,
      address_snapshot,
      payment_method,
      status,
      subtotal,
      delivery_fee,
      total,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      image_url
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const firstSubtotal = productRows[0].price * 2 + productRows[1].price;
  const firstOrder = insertOrder.run(
    customer.id,
    addressSnapshot,
    "UPI",
    "Packing",
    firstSubtotal,
    60,
    firstSubtotal + 60,
    now,
  );
  const firstOrderId = Number(firstOrder.lastInsertRowid);
  insertOrderItem.run(firstOrderId, productRows[0].id, productRows[0].name, 2, productRows[0].price, productRows[0].imageUrl);
  insertOrderItem.run(firstOrderId, productRows[1].id, productRows[1].name, 1, productRows[1].price, productRows[1].imageUrl);

  const secondSubtotal = productRows[2].price + productRows[3].price * 2;
  const secondOrder = insertOrder.run(
    customer.id,
    addressSnapshot,
    "Cash on Delivery",
    "Delivered",
    secondSubtotal,
    0,
    secondSubtotal,
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  );
  const secondOrderId = Number(secondOrder.lastInsertRowid);
  insertOrderItem.run(secondOrderId, productRows[2].id, productRows[2].name, 1, productRows[2].price, productRows[2].imageUrl);
  insertOrderItem.run(secondOrderId, productRows[3].id, productRows[3].name, 2, productRows[3].price, productRows[3].imageUrl);
}

seedUsers();
seedProducts();
seedAddressAndOrders();

export { db };
