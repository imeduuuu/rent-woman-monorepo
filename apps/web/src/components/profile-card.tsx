import type { ListingCard } from "@repo/types";
import Link from "next/link";
import { Badge } from "@repo/ui";

export function ProfileCard({ listing }: { listing: ListingCard }): JSX.Element {
  return (
    <Link
      href={`/directory/${listing.slug}`}
      className="group relative block aspect-[2/3] overflow-hidden rounded-card border border-[rgba(255,255,255,0.15)] bg-rw-black-100 transition-colors duration-base ease-rw-out hover:border-[rgba(255,255,255,0.35)] hover:bg-rw-black-200"
    >
      {/* Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-base group-hover:opacity-90"
        style={{ backgroundImage: `url(${listing.coverUrl || ""})`, backgroundColor: "var(--surface-3)" }}
      />

      {/* Top elements */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        {listing.isFeatured ? (
          <Badge variant="vip">vip</Badge>
        ) : (
          <div /> // placeholder for flex space-between
        )}
        <span className="rw-online-dot" />
      </div>

      {/* Bottom overlay (protection gradient) */}
      <div className="rw-card-gradient absolute inset-x-0 bottom-0 px-4 pb-4 pt-16">
        <div className="flex items-end justify-between">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[22px] font-semibold leading-tight text-white">
              {listing.title} <span className="font-body text-body-m font-normal text-rw-white-75">· 24</span>
            </h3>
            <p className="mt-0.5 truncate text-body-s text-rw-white-75">
              {listing.city} · <span className="text-white">€{listing.hourlyRate || 180}/h</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
