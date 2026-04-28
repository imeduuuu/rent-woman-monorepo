import { prisma } from "@repo/db";
import { Button, Card, Input } from "@repo/ui";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1200).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  hourlyRate: z.coerce.number().int().min(0).max(9999).optional(),
  languages: z.string().trim().max(200).optional(),
  tags: z.string().trim().max(300).optional(),
  isPublic: z.coerce.boolean().optional()
});

export default async function ProfilePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  });

  if (!user) redirect("/sign-in");

  async function saveProfileAction(formData: FormData): Promise<void> {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect("/sign-in");

    const raw = Object.fromEntries(formData.entries());
    const parsed = profileSchema.safeParse({
      ...raw,
      isPublic: raw.isPublic === "on"
    });
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid data.");

    const { name, headline, bio, city, country, hourlyRate, languages, tags, isPublic } = parsed.data;

    await prisma.user.update({
      where: { id: s.user.id },
      data: { name }
    });

    await prisma.profile.upsert({
      where: { userId: s.user.id },
      create: {
        userId: s.user.id,
        headline: headline ?? null,
        bio: bio ?? null,
        city: city ?? null,
        country: country ?? null,
        hourlyRate: hourlyRate ?? null,
        languages: languages ? languages.split(",").map((l) => l.trim()).filter(Boolean) : [],
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        isPublic: isPublic ?? false
      },
      update: {
        headline: headline ?? null,
        bio: bio ?? null,
        city: city ?? null,
        country: country ?? null,
        hourlyRate: hourlyRate ?? null,
        languages: languages ? languages.split(",").map((l) => l.trim()).filter(Boolean) : [],
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        isPublic: isPublic ?? false
      }
    });

    revalidatePath("/dashboard/profile");
  }

  const p = user.profile;

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-semibold text-white">Mi perfil</h1>
        <p className="mt-1 text-sm text-white/40">Esta información aparece en tu anuncio público.</p>
      </div>

      {/* Avatar placeholder */}
      <Card className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white/30">
          {(user.name ?? "?")[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white">Foto de perfil</p>
          <p className="text-xs text-white/40 mt-0.5">Disponible en la sección &quot;Mis fotos&quot;</p>
          <Link href="/dashboard/media" className="mt-2 inline-block text-xs text-brand-accent hover:underline">
            Ir a mis fotos →
          </Link>
        </div>
      </Card>

      <Card>
        <form action={saveProfileAction} className="space-y-5">

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Nombre</label>
            <Input defaultValue={user.name ?? ""} name="name" placeholder="Tu nombre" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Titular</label>
            <Input defaultValue={p?.headline ?? ""} name="headline" placeholder="Ej: Acompañante premium en Barcelona" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Bio</label>
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-brand-accent"
              defaultValue={p?.bio ?? ""}
              name="bio"
              placeholder="Cuéntate brevemente..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Ciudad</label>
              <Input defaultValue={p?.city ?? ""} name="city" placeholder="Barcelona" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">País</label>
              <Input defaultValue={p?.country ?? ""} name="country" placeholder="Spain" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Tarifa por hora (EUR)</label>
            <Input defaultValue={p?.hourlyRate ? String(p.hourlyRate) : ""} min={0} name="hourlyRate" placeholder="200" type="number" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Idiomas (separados por coma)</label>
            <Input defaultValue={(p?.languages ?? []).join(", ")} name="languages" placeholder="Español, Inglés, Francés" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/40">Tags (separados por coma)</label>
            <Input defaultValue={(p?.tags ?? []).join(", ")} name="tags" placeholder="masaje, viajes, cenas" />
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Perfil público</p>
              <p className="text-xs text-white/40">Visible en el directorio para todos</p>
            </div>
            <div className="relative">
              <input
                className="peer sr-only"
                defaultChecked={p?.isPublic ?? false}
                name="isPublic"
                type="checkbox"
              />
              <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-brand-accent transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <Button className="w-full" type="submit">Guardar perfil</Button>
        </form>
      </Card>
    </main>
  );
}
