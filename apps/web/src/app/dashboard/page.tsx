import { prisma } from "@repo/db";
import { Badge, Button, Card, CardDescription, CardTitle, Input } from "@repo/ui";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
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

const listingUpdateSchema = listingInputSchema.extend({
  listingId: z.string().min(1)
});

const listingActionSchema = z.object({
  listingId: z.string().min(1)
});

function parseFormData(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function slugify(input: string): string {
  const slug = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug || "listing";
}

async function createUniqueSlug(base: string): Promise<string> {
  let suffix = 0;

  while (suffix < 1000) {
    const candidate = suffix === 0 ? base : `${base}-${suffix}`;
    const exists = await prisma.listing.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!exists) {
      return candidate;
    }

    suffix += 1;
  }

  throw new Error("Unable to create a unique listing slug.");
}

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  async function createListingAction(formData: FormData): Promise<void> {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const parsed = listingInputSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing data.");
    }

    const slug = await createUniqueSlug(slugify(`${parsed.data.title}-${parsed.data.city}`));

    await prisma.listing.create({
      data: {
        ownerId: currentSession.user.id,
        slug,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        baseRate: parsed.data.baseRate,
        city: parsed.data.city,
        country: parsed.data.country,
        status: "DRAFT",
        isPublished: false,
        currency: "EUR"
      }
    });

    revalidatePath("/dashboard");
  }

  async function updateListingAction(formData: FormData): Promise<void> {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const parsed = listingUpdateSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing data.");
    }

    const existingListing = await prisma.listing.findFirst({
      where: {
        id: parsed.data.listingId,
        ownerId: currentSession.user.id
      },
      select: {
        id: true,
        isPublished: true,
        status: true
      }
    });

    if (!existingListing) {
      throw new Error("Listing not found.");
    }

    await prisma.listing.update({
      where: {
        id: existingListing.id
      },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        baseRate: parsed.data.baseRate,
        city: parsed.data.city,
        country: parsed.data.country,
        status: existingListing.isPublished ? "ACTIVE" : existingListing.status
      }
    });

    revalidatePath("/dashboard");
  }

  async function toggleListingPublishAction(formData: FormData): Promise<void> {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const parsed = listingActionSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      throw new Error("Invalid listing action.");
    }

    const listing = await prisma.listing.findFirst({
      where: {
        id: parsed.data.listingId,
        ownerId: currentSession.user.id
      },
      select: {
        id: true,
        isPublished: true
      }
    });

    if (!listing) {
      throw new Error("Listing not found.");
    }

    await prisma.listing.update({
      where: {
        id: listing.id
      },
      data: listing.isPublished
        ? {
            isPublished: false,
            status: "DRAFT",
            publishedAt: null
          }
        : {
            isPublished: true,
            status: "ACTIVE",
            publishedAt: new Date()
          }
    });

    revalidatePath("/dashboard");
  }

  async function deleteListingAction(formData: FormData): Promise<void> {
    "use server";

    const currentSession = await auth();

    if (!currentSession?.user?.id) {
      redirect("/sign-in");
    }

    const parsed = listingActionSchema.safeParse(parseFormData(formData));

    if (!parsed.success) {
      throw new Error("Invalid listing action.");
    }

    await prisma.listing.deleteMany({
      where: {
        id: parsed.data.listingId,
        ownerId: currentSession.user.id
      }
    });

    revalidatePath("/dashboard");
  }

  const [user, listings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true
      }
    }),
    prisma.listing.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <main className="container-page space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{user?.name ?? "Profile owner"}</CardTitle>
            <Badge>{session.user.role}</Badge>
            <Badge>{session.user.subscriptionPlan}</Badge>
            <Badge>{session.user.verificationStatus}</Badge>
          </div>
          <CardDescription>{user?.profile?.headline ?? "No public headline yet."}</CardDescription>
          <p className="text-sm text-white/70">
            Complete your onboarding, request KYC, upload approved media, and activate a higher plan for visibility.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/verification">
              <Button>Launch verification</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary">Manage plan</Button>
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <CardTitle>Profile summary</CardTitle>
          <div className="text-sm text-white/70">
            <div>Email: {user?.email ?? "—"}</div>
            <div>City: {user?.profile?.city ?? "—"}</div>
            <div>Country: {user?.profile?.country ?? "—"}</div>
            <div>Public: {user?.profile?.isPublic ? "Yes" : "No"}</div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Create a new listing</h2>
        <Card>
          <form action={createListingAction} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="title" placeholder="Title" required />
              <Input name="category" placeholder="Category" required />
              <Input min={50} name="baseRate" placeholder="Base rate (EUR)" required step={10} type="number" />
              <Input name="city" placeholder="City" required />
            </div>
            <Input name="country" placeholder="Country" required />
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-brand-accent"
              name="description"
              placeholder="Description"
              required
            />
            <Button type="submit">Create draft listing</Button>
          </form>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Your listings</h2>
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card className="space-y-4" key={listing.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{listing.title}</div>
                  <div className="text-sm text-white/60">
                    {listing.city}, {listing.country}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge>{listing.status}</Badge>
                  {listing.isFeatured ? <Badge>Featured</Badge> : null}
                </div>
              </div>

              <form action={updateListingAction} className="space-y-4">
                <input name="listingId" type="hidden" value={listing.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <Input defaultValue={listing.title} name="title" required />
                  <Input defaultValue={listing.category} name="category" required />
                  <Input defaultValue={String(listing.baseRate)} min={50} name="baseRate" required step={10} type="number" />
                  <Input defaultValue={listing.city} name="city" required />
                </div>
                <Input defaultValue={listing.country} name="country" required />
                <textarea
                  className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-brand-accent"
                  defaultValue={listing.description}
                  name="description"
                  required
                />
                <Button type="submit" variant="secondary">
                  Save changes
                </Button>
              </form>

              <div className="flex flex-wrap gap-3">
                <form action={toggleListingPublishAction}>
                  <input name="listingId" type="hidden" value={listing.id} />
                  <Button type="submit">{listing.isPublished ? "Unpublish" : "Publish now"}</Button>
                </form>

                <form action={deleteListingAction}>
                  <input name="listingId" type="hidden" value={listing.id} />
                  <Button type="submit" variant="ghost">
                    Delete
                  </Button>
                </form>
              </div>
            </Card>
          ))}

          {listings.length === 0 ? (
            <Card>
              <CardDescription>You do not have any listings yet.</CardDescription>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
