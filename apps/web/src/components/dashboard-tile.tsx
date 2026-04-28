"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface DashboardTileProps {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: number;
  statusDot?: "green" | "amber";
  sublabel?: string;
}

export function DashboardTile({
  icon,
  label,
  href,
  badge,
  statusDot,
  sublabel
}: DashboardTileProps): JSX.Element {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/8 px-4 py-7 text-center transition hover:bg-white/10 active:scale-95"
    >
      {badge ? (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}

      {statusDot ? (
        <span
          className={`absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-[#0f0f0f] ${
            statusDot === "green" ? "bg-green-400" : "bg-amber-400"
          }`}
        />
      ) : null}

      <span className="text-white/80">{icon}</span>
      <span className="text-sm font-medium leading-tight text-white">{label}</span>
      {sublabel ? <span className="text-xs text-white/40">{sublabel}</span> : null}
    </Link>
  );
}
