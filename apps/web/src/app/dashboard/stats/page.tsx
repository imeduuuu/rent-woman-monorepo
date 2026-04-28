import { prisma } from "@repo/db";
import { Card } from "@repo/ui";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function StatsPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [listingsCount, mediaCount, favoritesCount, reviewsCount] = await Promise.all([
    prisma.listing.count({ where: { ownerId: session.user.id, isPublished: true } }),
    prisma.mediaAsset.count({ where: { ownerId: session.user.id, moderationStatus: "APPROVED" } }),
    prisma.favorite.count({ where: { listing: { ownerId: session.user.id } } }),
    prisma.review.count({ where: { targetId: session.user.id } })
  ]);

  const stats = [
    { label: "Anuncios activos", value: listingsCount },
    { label: "Fotos aprobadas", value: mediaCount },
    { label: "Guardados en favoritos", value: favoritesCount },
    { label: "Reviews recibidas", value: reviewsCount }
  ];

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-semibold text-white">Visitas y estadísticas</h1>
        <p className="mt-1 text-sm text-white/40">Resumen de actividad de tu perfil.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center space-y-1">
            <p className="text-3xl font-bold text-brand-accent">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm text-white/40 text-center">Las métricas de visitas detalladas (pageviews, clics) estarán disponibles próximamente.</p>
      </Card>
    </main>
  );
}
