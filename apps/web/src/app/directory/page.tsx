import { ListingCard } from "@/components/listing-card";
import { fetchListings } from "@/lib/api";

export default async function DirectoryPage(): Promise<JSX.Element> {
  const listings = await fetchListings();

  return (
    <main className="container-page space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">Directory</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Browse public profiles, verify quality signals, and filter for featured members in high-value cities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-white/60">
            No public listings were returned by the API.
          </div>
        ) : null}
      </div>
    </main>
  );
}
