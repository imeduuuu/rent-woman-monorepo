import { Badge, Card } from "@repo/ui";
import { notFound } from "next/navigation";


import { fetchListing } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default async function ListingDetailPage({
  params
}: {
  params: { slug: string };
}): Promise<JSX.Element> {
  const { slug } = params;
  const listing = await fetchListing(slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="container-page space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{listing.category}</Badge>
        <Badge>{listing.city}</Badge>
        <Badge>{listing.country}</Badge>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div>
            <h1 className="text-5xl font-semibold">{listing.title}</h1>
            <p className="mt-4 text-lg text-white/70">{listing.description}</p>
          </div>

          {listing.bio ? <p className="max-w-3xl leading-7 text-white/80">{listing.bio}</p> : null}

          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </div>

        <Card className="space-y-4">
          <div className="text-sm uppercase tracking-[0.2em] text-white/50">Base rate</div>
          <div className="text-4xl font-semibold text-brand-accent">
            {formatCurrency(listing.baseRate, listing.currency)}
          </div>
          <div className="text-sm text-white/60">Languages: {listing.languages.join(", ")}</div>
          <div className="text-sm text-white/60">
            Reviews: {listing.reviewCount} • Rating: {listing.rating.toFixed(1)}
          </div>
        </Card>
      </section>
    </main>
  );
}
