
import type { ListingCard as ListingCardType } from "@repo/types";
import { Badge, Card, CardDescription, CardTitle } from "@repo/ui";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";

export function ListingCard({ listing }: { listing: ListingCardType }): JSX.Element {
  return (
    <Link href={`/directory/${listing.slug}`}>
      <Card className="h-full transition hover:-translate-y-1 hover:border-brand-accent/50">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <CardTitle>{listing.title}</CardTitle>
            <CardDescription>
              {listing.city}, {listing.country}
            </CardDescription>
          </div>
          {listing.isFeatured ? <Badge>Featured</Badge> : null}
        </div>

        <p className="line-clamp-3 text-sm text-white/70">{listing.description}</p>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-white/60">{listing.category}</span>
          <span className="font-semibold text-brand-accent">
            {formatCurrency(listing.baseRate, listing.currency)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
