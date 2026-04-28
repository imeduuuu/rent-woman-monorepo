"use client";

import { useState } from "react";

export function AvailabilityToggle(): JSX.Element {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle(): Promise<void> {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setAvailable((prev) => !prev);
    setLoading(false);
  }

  return (
    <button
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center transition hover:bg-white/8 disabled:opacity-50"
      disabled={loading}
      onClick={() => void toggle()}
      type="button"
    >
      <div className="flex flex-col items-center gap-4">
        <span className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-colors ${available ? "border-green-400 bg-green-400/10" : "border-white/20 bg-white/5"}`}>
          <svg fill="none" height={28} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" width={28} className={available ? "text-green-400" : "text-white/30"}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div>
          <p className={`text-xl font-semibold ${available ? "text-green-400" : "text-white/60"}`}>
            {available ? "Disponible ahora" : "No disponible"}
          </p>
          <p className="mt-1 text-sm text-white/40">
            {available ? "Los clientes ven tu punto verde activo" : "Toca para activar tu disponibilidad"}
          </p>
        </div>
      </div>
    </button>
  );
}
