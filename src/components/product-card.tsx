import Image from "next/image";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="panel overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--brand)]">
            {product.category}
          </span>
          {product.featured ? (
            <span className="flex items-center gap-1 rounded-full bg-[#fff0d8]/90 px-3 py-1 text-xs font-semibold text-[#9a5b16]">
              <Star className="h-3.5 w-3.5 fill-current" />
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">{product.name}</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{product.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[color:var(--brand)]">{formatCurrency(product.price)}</p>
            <p className="text-sm text-[color:var(--muted)]">{product.unit}</p>
          </div>
        </div>

        <div className="mt-5">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
