import Link from "next/link";

const links = {
  platform: [
    { label: "Directory", href: "/directory" },
    { label: "Pricing", href: "/pricing" },
    { label: "Apply as talent", href: "/sign-up" }
  ],
  account: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Messages", href: "/chat" }
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Content policy", href: "/content-policy" }
  ]
};

export function SiteFooter(): JSX.Element {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-screen px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <span className="text-lg font-bold tracking-[0.2em] text-white">rwoman</span>
            <p className="max-w-xs text-sm leading-6 text-white/50">
              Premium verified directory. KYC onboarding, moderated media, real-time messaging, and subscription revenue in one platform.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Platform</p>
            <ul className="space-y-3">
              {links.platform.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-white/60 transition hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Account</p>
            <ul className="space-y-3">
              {links.account.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-white/60 transition hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Legal</p>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link className="text-sm text-white/60 transition hover:text-white" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 md:flex-row">
          <span>© {new Date().getFullYear()} rwoman. All rights reserved.</span>
          <span>18+ only. All profiles are identity-verified.</span>
        </div>
      </div>
    </footer>
  );
}
