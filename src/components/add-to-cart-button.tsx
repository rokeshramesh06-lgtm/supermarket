"use client";

import { Check, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) {
      return;
    }

    const timer = window.setTimeout(() => setAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <button
      type="button"
      className={added ? "button-secondary w-full" : "button-primary w-full"}
      onClick={() => {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          imageUrl: product.imageUrl,
          category: product.category,
        });
        setAdded(true);
      }}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBasket className="h-4 w-4" />}
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
