import type { Address, OrderStatus } from "@/lib/types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export function getSafeRedirectPath(value: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function formatSavedAddress(address: Address) {
  return [
    address.recipientName,
    address.phone,
    [address.line1, address.line2].filter(Boolean).join(", "),
    [address.city, address.state, address.pincode].filter(Boolean).join(", "),
    address.deliveryNotes,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatOrderStatusClass(status: OrderStatus) {
  if (status === "Placed") {
    return "status-placed";
  }

  if (status === "Packing") {
    return "status-packing";
  }

  if (status === "Out for Delivery") {
    return "status-transit";
  }

  return "status-delivered";
}
