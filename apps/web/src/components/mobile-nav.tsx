"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Directory", href: "/directory" },
  { label: "Pricing", href: "/pricing" },
  { label: "Messages", href: "/chat" },
  { label: "Dashboard", href: "/dashboard" }
];

export function MobileNav({ userEmail }: { userEmail?: string | null }): JSX.Element {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {open ? (
          <svg fill="none" height={18} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={18}>
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg fill="none" height={18} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" width={18}>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 top-[65px] z-50 flex flex-col bg-[#080808]">
          <nav className="flex flex-col border-b border-white/10 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                className="border-b border-white/5 py-4 text-base font-medium text-white/70 transition last:border-0 hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="px-6 py-6">
            {userEmail ? (
              <p className="text-sm text-white/40">{userEmail}</p>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm font-semibold text-white transition hover:bg-white/5"
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className="flex h-11 items-center justify-center rounded-xl bg-brand-accent text-sm font-semibold text-black transition hover:opacity-90"
                  href="/sign-up"
                >
                  Apply
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
