import { Badge } from "@repo/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchListing } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default async function ListingDetailPage({
  params
}: {
  params: { slug: string };
}): Promise<JSX.Element> {
  const listing = await fetchListing(params.slug);

  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">

      {/* Back */}
      <Link href="/directory" className="text-xs text-white/40 hover:text-white">← Directorio</Link>

      {/* Hero photo */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[#1a1a1a] sm:aspect-[3/2]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

        {/* Status dot */}
        <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-green-400 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Disponible
        </span>

        {listing.isFeatured ? (
          <span className="absolute right-4 top-4 rounded-full bg-brand-accent px-3 py-1 text-xs font-bold text-black">
            DESTACADO
          </span>
        ) : null}

        {/* Name overlay */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
          <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
          <p className="mt-1 text-sm text-white/70">
            {listing.city}, {listing.country}
          </p>
        </div>
      </div>

      {/* Rate + CTA */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Tarifa base</p>
          <p className="text-2xl font-bold text-brand-accent">{formatCurrency(listing.baseRate, listing.currency)}</p>
        </div>
        <Link
          href="/chat"
          className="rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
        >
          Enviar mensaje
        </Link>
      </div>

      {/* Tags + info */}
      <div className="space-y-4">
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex gap-4 text-sm text-white/50">
          <span>Categoría: <span className="text-white/80">{listing.category}</span></span>
          {listing.languages && listing.languages.length > 0 && (
            <span>Idiomas: <span className="text-white/80">{listing.languages.join(", ")}</span></span>
          )}
        </div>
      </div>

      {/* Bio / description */}
      {listing.bio ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Sobre mí</p>
          <p className="leading-7 text-white/80">{listing.bio}</p>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Descripción</p>
        <p className="leading-7 text-white/70">{listing.description}</p>
      </div>

      {/* Reviews */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-accent">{listing.rating.toFixed(1)}</p>
          <p className="text-xs text-white/40">Rating</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{listing.reviewCount}</p>
          <p className="text-xs text-white/40">Reviews</p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex-1">
          <p className="text-xs text-white/40">Las reviews son verificadas por la plataforma.</p>
        </div>
      </div>

      {/* Bottom CTA */}
      <Link
        href="/chat"
        className="flex w-full items-center justify-center rounded-2xl bg-brand-accent py-4 text-base font-bold text-black transition hover:opacity-90"
      >
        Contactar ahora
      </Link>
    </main>
  );
}
