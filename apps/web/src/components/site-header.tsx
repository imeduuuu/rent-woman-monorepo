import { Button } from "@repo/ui";
import Link from "next/link";

import { MobileNav } from "./mobile-nav";

import { auth, signOut } from "@/auth";

export async function SiteHeader(): Promise<JSX.Element> {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen items-center justify-between px-6 py-4">
        <Link className="text-lg font-bold tracking-[0.2em] text-white" href="/">
          rwoman
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link className="transition hover:text-white" href="/directory">Directory</Link>
          <Link className="transition hover:text-white" href="/pricing">Pricing</Link>
          <Link className="transition hover:text-white" href="/chat">Messages</Link>
          <Link className="transition hover:text-white" href="/dashboard">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-white/70 md:inline-flex">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link className="hidden md:block" href="/sign-in">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link className="hidden md:block" href="/sign-up">
                <Button>Apply</Button>
              </Link>
            </>
          )}
          <MobileNav userEmail={session?.user?.email} />
        </div>
      </div>
    </header>
  );
}
