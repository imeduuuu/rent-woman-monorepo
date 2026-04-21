import type { Metadata } from "next";
import type { ReactNode } from "react";


import "./globals.css";

import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "RENT WOMAN",
  description: "Luxury companion directory, bookings, messaging, verification, and premium memberships."
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
