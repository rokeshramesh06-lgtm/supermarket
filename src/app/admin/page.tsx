import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllOrders, getCustomers, getProductById, getProducts } from "@/lib/data";
import { orderStatuses, productCategories } from "@/lib/types";
import { formatCurrency, formatDate, formatOrderStatusClass, formatSavedAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{
    edit?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const editingId = typeof params.edit === "string" ? Number(params.edit) : NaN;
  const editingProduct = Number.isFinite(editingId) ? getProductById(editingId) : null;
  const products = getProducts();
  const orders = getAllOrders();
  const customers = getCustomers();
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="page-shell space-y-6">
      <section className="panel panel-strong p-8">
        <p className="eyebrow">Admin Panel</p>
        <h1 className="display-font mt-3 text-5xl font-semibold leading-none">
          Store operations at a glance.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-[color:var(--muted)]">
          Manage product inventory, update order progress, and keep an eye on your customer base from one dashboard.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] bg-white/72 p-5">
            <p className="text-sm text-[color:var(--muted)]">Products</p>
            <p className="mt-2 text-4xl font-bold text-[color:var(--brand)]">{products.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/72 p-5">
            <p className="text-sm text-[color:var(--muted)]">Orders</p>
            <p className="mt-2 text-4xl font-bold text-[color:var(--brand)]">{orders.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/72 p-5">
            <p className="text-sm text-[color:var(--muted)]">Customers</p>
            <p className="mt-2 text-4xl font-bold text-[color:var(--brand)]">{customers.length}</p>
          </div>
          <div className="rounded-[24px] bg-white/72 p-5">
            <p className="text-sm text-[color:var(--muted)]">Revenue</p>
            <p className="mt-2 text-4xl font-bold text-[color:var(--brand)]">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </section>

      <section id="product-form" className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="panel p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Inventory</p>
              <h2 className="text-3xl font-semibold">
                {editingProduct ? `Edit ${editingProduct.name}` : "Add a new product"}
              </h2>
            </div>
            {editingProduct ? (
              <Link className="button-secondary" href="/admin#product-form">
                Clear form
              </Link>
            ) : null}
          </div>

          <form action="/admin/products" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="id" value={editingProduct?.id ?? ""} />

            <div>
              <label className="field-label" htmlFor="name">
                Product name
              </label>
              <input id="name" className="input" type="text" name="name" defaultValue={editingProduct?.name ?? ""} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="category">
                  Category
                </label>
                <select id="category" className="select" name="category" defaultValue={editingProduct?.category ?? productCategories[0]}>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="unit">
                  Unit
                </label>
                <input id="unit" className="input" type="text" name="unit" placeholder="500 g pack" defaultValue={editingProduct?.unit ?? ""} required />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="price">
                Price
              </label>
              <input id="price" className="input" type="number" name="price" min="1" step="0.01" defaultValue={editingProduct?.price ?? ""} required />
            </div>

            <div>
              <label className="field-label" htmlFor="imageUrl">
                Product image URL
              </label>
              <input id="imageUrl" className="input" type="url" name="imageUrl" defaultValue={editingProduct?.imageUrl ?? ""} required />
            </div>

            <div>
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="textarea"
                name="description"
                defaultValue={editingProduct?.description ?? ""}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3">
                <input type="checkbox" name="featured" defaultChecked={Boolean(editingProduct?.featured ?? 1)} />
                <span className="text-sm font-semibold">Highlight as featured</span>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3">
                <input type="checkbox" name="inStock" defaultChecked={Boolean(editingProduct?.inStock ?? 1)} />
                <span className="text-sm font-semibold">In stock</span>
              </label>
            </div>

            <button className="button-primary w-full sm:w-auto" type="submit">
              {editingProduct ? "Update product" : "Add product"}
            </button>
          </form>
        </section>

        <section className="panel p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Products</p>
              <h2 className="text-3xl font-semibold">Current catalogue</h2>
            </div>
            <p className="text-sm text-[color:var(--muted)]">Tap edit to load the form with existing values.</p>
          </div>

          <div className="mt-6 grid gap-4">
            {products.map((product) => (
              <article key={product.id} className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <span className="rounded-full bg-[#eff7ef] px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                        {product.category}
                      </span>
                      {!product.inStock ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          Out of stock
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{product.description}</p>
                    <p className="mt-3 text-sm font-semibold text-[color:var(--muted)]">
                      {formatCurrency(product.price)} • {product.unit}
                    </p>
                  </div>
                  <Link className="button-secondary" href={`/admin?edit=${product.id}#product-form`}>
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section id="orders" className="panel p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Orders</p>
            <h2 className="text-3xl font-semibold">Manage customer orders</h2>
          </div>
          <p className="text-sm text-[color:var(--muted)]">Update fulfillment stages as orders move through the store.</p>
        </div>

        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[28px] border border-[color:var(--border)] bg-white/72 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                    <span className={`status-pill ${formatOrderStatusClass(order.status)}`}>{order.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {order.customerName} • {order.customerEmail}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {formatDate(order.createdAt)} • {order.paymentMethod}
                  </p>
                </div>
                <div className="text-left lg:text-right">
                  <p className="text-sm text-[color:var(--muted)]">Total</p>
                  <p className="text-2xl font-bold text-[color:var(--brand)]">{formatCurrency(order.total)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white/72 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{item.productName}</p>
                        <span>{item.quantity} pcs</span>
                      </div>
                      <p className="mt-1 text-[color:var(--muted)]">
                        {formatCurrency(item.unitPrice)} each • Line total {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 rounded-[24px] bg-[#f8f3e8] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">Delivery address</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-[color:var(--muted)]">
                      {formatSavedAddress(order.addressSnapshot)}
                    </p>
                  </div>

                  <form action="/admin/orders" method="post" className="space-y-3">
                    <input type="hidden" name="id" value={order.id} />
                    <div>
                      <label className="field-label" htmlFor={`status-${order.id}`}>
                        Update status
                      </label>
                      <select id={`status-${order.id}`} className="select" name="status" defaultValue={order.status}>
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="button-secondary w-full" type="submit">
                      Save status
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="customers" className="panel p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Customers</p>
            <h2 className="text-3xl font-semibold">Customer directory</h2>
          </div>
          <p className="text-sm text-[color:var(--muted)]">Review activity and saved delivery details.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {customers.map((customer) => (
            <article key={customer.id} className="rounded-[24px] border border-[color:var(--border)] bg-white/72 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{customer.email}</p>
                </div>
                <span className="rounded-full bg-[#eff7ef] px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
                  {customer.totalOrders} orders
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--muted)]">
                <p>Joined on {formatDate(customer.createdAt)}</p>
                <p>Total spend: {formatCurrency(customer.totalSpent)}</p>
                <p>
                  Last order: {customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "No orders yet"}
                </p>
                <p className="whitespace-pre-line">
                  {customer.address ? formatSavedAddress(customer.address) : "No saved address"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
