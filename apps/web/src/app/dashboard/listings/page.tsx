import { prisma } from "@repo/db";
import { Badge, Button, Card, Input } from "@repo/ui";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

import { auth } from "@/auth";

const listingInputSchema = z.object({
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().min(20).max(1000),
  category: z.string().trim().min(3).max(60),
  baseRate: z.coerce.number().int().min(50).max(5000),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80)
});

const listingUpdateSchema = listingInputSchema.extend({ listingId: z.string().min(1) });
const listingActionSchema = z.object({ listingId: z.string().min(1) });

function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") || "listing"
  );
}

async function createUniqueSlug(base: string): Promise<string> {
  for (let i = 0; i < 1000; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const exists = await prisma.listing.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!exists) return candidate;
  }
  throw new Error("Unable to create a unique slug.");
}

const statusColors: Record<string, string> = {
  DRAFT: "text-white/40",
  PENDING_REVIEW: "text-amber-400",
  ACTIVE: "text-green-400",
  REJECTED: "text-red-400",
  SUSPENDED: "text-red-400"
};

export default async function ListingsPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  async function createListingAction(formData: FormData): Promise<void> {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/sign-in");
    const parsed = listingInputSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid data.");
    const slug = await createUniqueSlug(slugify(`${parsed.data.title}-${parsed.data.city}`));
    await prisma.listing.create({
      data: { ownerId: s.user.id, slug, ...parsed.data, status: "DRAFT", isPublished: false, currency: "EUR" }
    });
    revalidatePath("/dashboard/listings");
  }

  async function updateListingAction(formData: FormData): Promise<void> {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/sign-in");
    const parsed = listingUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid data.");
    const { listingId, ...data } = parsed.data;
    const existing = await prisma.listing.findFirst({ where: { id: listingId, ownerId: s.user.id }, select: { id: true, isPublished: true, status: true } });
    if (!existing) throw new Error("Listing not found.");
    await prisma.listing.update({ where: { id: existing.id }, data: { ...data, status: existing.isPublished ? "ACTIVE" : existing.status } });
    revalidatePath("/dashboard/listings");
  }

  async function togglePublishAction(formData: FormData): Promise<void> {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/sign-in");
    const parsed = listingActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) throw new Error("Invalid action.");
    const listing = await prisma.listing.findFirst({ where: { id: parsed.data.listingId, ownerId: s.user.id }, select: { id: true, isPublished: true } });
    if (!listing) throw new Error("Listing not found.");
    await prisma.listing.update({
      where: { id: listing.id },
      data: listing.isPublished
        ? { isPublished: false, status: "DRAFT", publishedAt: null }
        : { isPublished: true, status: "ACTIVE", publishedAt: new Date() }
    });
    revalidatePath("/dashboard/listings");
  }

  async function deleteListingAction(formData: FormData): Promise<void> {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/sign-in");
    const parsed = listingActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) throw new Error("Invalid action.");
    await prisma.listing.deleteMany({ where: { id: parsed.data.listingId, ownerId: s.user.id } });
    revalidatePath("/dashboard/listings");
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-white/40 hover:text-white">← Dashboard</Link>
          <h1 className="mt-1 text-2xl font-semibold text-white">Mis anuncios</h1>
        </div>
      </div>

      {/* Create form */}
      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-white">Nuevo anuncio</h2>
        <form action={createListingAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input name="title" placeholder="Título" required />
            <Input name="category" placeholder="Categoría" required />
            <Input min={50} name="baseRate" placeholder="Tarifa (EUR)" required step={10} type="number" />
            <Input name="city" placeholder="Ciudad" required />
          </div>
          <Input name="country" placeholder="País" required />
          <textarea
            className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-brand-accent"
            name="description"
            placeholder="Descripción (mín. 20 caracteres)"
            required
          />
          <Button type="submit" className="w-full">Crear borrador</Button>
        </form>
      </Card>

      {/* Listing list */}
      <div className="space-y-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{listing.title}</p>
                <p className="text-xs text-white/50">{listing.city}, {listing.country}</p>
              </div>
              <span className={`text-xs font-semibold ${statusColors[listing.status] ?? "text-white/40"}`}>
                {listing.status}
              </span>
            </div>

            <form action={updateListingAction} className="space-y-3">
              <input name="listingId" type="hidden" value={listing.id} />
              <div className="grid grid-cols-2 gap-3">
                <Input defaultValue={listing.title} name="title" required />
                <Input defaultValue={listing.category} name="category" required />
                <Input defaultValue={String(listing.baseRate)} min={50} name="baseRate" required step={10} type="number" />
                <Input defaultValue={listing.city} name="city" required />
              </div>
              <Input defaultValue={listing.country} name="country" required />
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-brand-accent"
                defaultValue={listing.description}
                name="description"
                required
              />
              <Button type="submit" variant="secondary" className="w-full">Guardar cambios</Button>
            </form>

            <div className="flex gap-3">
              <form action={togglePublishAction} className="flex-1">
                <input name="listingId" type="hidden" value={listing.id} />
                <Button type="submit" className="w-full">{listing.isPublished ? "Despublicar" : "Publicar"}</Button>
              </form>
              <form action={deleteListingAction}>
                <input name="listingId" type="hidden" value={listing.id} />
                <Button type="submit" variant="ghost">Eliminar</Button>
              </form>
            </div>
          </Card>
        ))}

        {listings.length === 0 && (
          <Card>
            <p className="text-sm text-white/50">Aún no tienes anuncios. Crea el primero arriba.</p>
          </Card>
        )}
      </div>
    </main>
  );
}
