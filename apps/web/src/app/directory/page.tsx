import { ProfileCard } from "@/components/profile-card";
import { fetchListings } from "@/lib/api";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

export default async function DirectoryPage(): Promise<JSX.Element> {
  const listings = await fetchListings();

  return (
    <main className="container-page py-8 space-y-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-display-l text-white">Directorio</h1>

        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-input border border-[rgba(255,255,255,0.15)] bg-rw-black-300 px-3 text-body-m text-rw-white-75 focus-within:border-rw-pink transition-colors">
            <MapPin className="h-4 w-4 shrink-0 text-rw-white-45" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Todo el mundo"
              className="w-full bg-transparent text-white placeholder:text-rw-white-45 outline-none"
            />
          </div>
          <button className="flex h-10 items-center justify-center gap-2 rounded-input border border-[rgba(255,255,255,0.15)] bg-transparent px-4 text-body-m text-white transition-colors hover:border-[rgba(255,255,255,0.35)]">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            Filtros
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["Todos", "Online", "Verificados", "Barcelona", "Madrid", "Premium"].map((filter, i) => (
          <button
            key={filter}
            type="button"
            className={`shrink-0 rounded-pill border px-4 py-1.5 text-body-xs font-medium tracking-[0.02em] transition-colors ${
              i === 0
                ? "border-rw-pink-border bg-rw-pink-soft text-rw-pink"
                : "border-[rgba(255,255,255,0.15)] bg-transparent text-rw-white-75 hover:border-[rgba(255,255,255,0.35)] hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {listings.map((listing) => (
            <ProfileCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          <p className="text-body-l font-medium text-white">No hay perfiles que coincidan con tu búsqueda.</p>
          <p className="text-body-m text-rw-white-45">Vuelve más tarde o amplía los filtros.</p>
        </div>
      )}
    </main>
  );
}
