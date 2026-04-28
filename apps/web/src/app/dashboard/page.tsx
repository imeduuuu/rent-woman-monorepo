import { prisma } from "@repo/db";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardTile } from "@/components/dashboard-tile";

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconProfile() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconListings() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconMedia() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path d="M3 17l5-5 4 4 5-6 4 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Plan banner ─────────────────────────────────────────────────────────────

const planLabels: Record<string, string> = {
  FREE: "Free plan",
  PREMIUM: "Premium",
  ELITE: "Elite"
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  });

  if (!user) {
    redirect("/sign-in");
  }

  const pendingMediaCount = await prisma.mediaAsset.count({
    where: { ownerId: user.id, moderationStatus: "PENDING" }
  });

  const isFree = user.subscriptionPlan === "FREE";
  const planLabel = planLabels[user.subscriptionPlan] ?? user.subscriptionPlan;

  const avatarUrl = user.profile?.avatarKey
    ? `${process.env.AWS_S3_PUBLIC_BASE_URL ?? ""}/${user.profile.avatarKey}`
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">

      {/* ── Profile header ── */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
          {avatarUrl ? (
            <img alt={user.name ?? "Avatar"} className="h-full w-full object-cover" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/30">
              {(user.name ?? "?")[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">{user.name ?? "Your name"}</p>
          <p className="text-sm text-white/50">
            {user.profile?.city && user.profile?.country
              ? `${user.profile.city}, ${user.profile.country}`
              : "Add your location"}
          </p>
        </div>
      </div>

      {/* ── Plan banner ── */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Plan activo</p>
          <p className="mt-0.5 text-base font-semibold text-white">{planLabel}</p>
          {isFree ? (
            <p className="text-xs text-white/40">Upgrade para más visibilidad</p>
          ) : (
            <p className="text-xs text-brand-accent">Activo</p>
          )}
        </div>
        <Link
          href="/pricing"
          className="shrink-0 rounded-xl bg-brand-accent px-4 py-2 text-xs font-bold text-black transition hover:opacity-90"
        >
          {isFree ? "Upgrade" : "Gestionar"}
        </Link>
      </div>

      {/* ── Tile grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <DashboardTile
          href="/dashboard/profile"
          icon={<IconProfile />}
          label="Mi perfil"
        />
        <DashboardTile
          href="/dashboard/listings"
          icon={<IconListings />}
          label="Mis anuncios"
        />
        <DashboardTile
          href="/dashboard/availability"
          icon={<IconClock />}
          label="Disponible ahora"
          statusDot="green"
          sublabel="Activar / desactivar"
        />
        <DashboardTile
          href="/dashboard/media"
          icon={<IconLock />}
          label="Fotos privadas"
          badge={pendingMediaCount > 0 ? pendingMediaCount : undefined}
        />
        <DashboardTile
          href="/dashboard/stats"
          icon={<IconEye />}
          label="Visitas"
        />
        <DashboardTile
          href="/dashboard/media"
          icon={<IconMedia />}
          label="Mis fotos"
        />
        <DashboardTile
          href="/pricing"
          icon={<IconChart />}
          label="Planes y precios"
        />
        <DashboardTile
          href="/dashboard/verification"
          icon={<IconSettings />}
          label="Verificación KYC"
          statusDot={user.verificationStatus === "APPROVED" ? "green" : "amber"}
        />
      </div>

      {/* ── Quick nav ── */}
      <details className="rounded-2xl border border-white/10 bg-white/5">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white/70 hover:text-white">
          Navegación del sitio
          <svg fill="none" height={16} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={16}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className="flex flex-col border-t border-white/10 px-5 py-2">
          {[
            { label: "Directory", href: "/directory" },
            { label: "Pricing", href: "/pricing" },
            { label: "Messages", href: "/chat" },
            { label: "Sign out", href: "/api/auth/signout" }
          ].map((item) => (
            <Link
              className="border-b border-white/5 py-3 text-sm text-white/60 transition last:border-0 hover:text-white"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </details>
    </main>
  );
}
