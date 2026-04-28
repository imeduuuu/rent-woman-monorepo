import { prisma } from "@repo/db";
import { Card } from "@repo/ui";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { MediaUploader } from "@/components/media-uploader";

const moderationColors: Record<string, string> = {
  PENDING: "text-amber-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  FLAGGED: "text-red-400"
};

const moderationLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  FLAGGED: "Marcada"
};

export default async function MediaPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const assets = await prisma.mediaAsset.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  const s3Base = process.env.AWS_S3_PUBLIC_BASE_URL ?? "";

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-semibold text-white">Mis fotos</h1>
        <p className="mt-1 text-sm text-white/40">Las fotos pasan por moderación antes de aparecer públicamente.</p>
      </div>

      {/* Uploader */}
      <MediaUploader userId={session.user.id} />

      {/* Asset grid */}
      {assets.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {assets.map((asset) => (
            <div key={asset.id} className="relative aspect-square overflow-hidden rounded-xl bg-white/5">
              {asset.mediaType === "IMAGE" ? (
                <img
                  alt=""
                  className="h-full w-full object-cover"
                  src={`${s3Base}/${asset.storageKey}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/30">
                  <svg fill="none" height={24} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" width={24}>
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <span className={`absolute bottom-1 left-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold ${moderationColors[asset.moderationStatus] ?? "text-white/40"}`}>
                {moderationLabels[asset.moderationStatus] ?? asset.moderationStatus}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-white/50">Aún no has subido ninguna foto. Usa el botón de arriba para empezar.</p>
        </Card>
      )}
    </main>
  );
}
