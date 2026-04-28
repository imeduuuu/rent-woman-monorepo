import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportWidgetLoader } from "@/components/support-widget-loader";

export const metadata: Metadata = {
  title: "rwoman",
  description: "Luxury companion directory, bookings, messaging, verification, and premium memberships."
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="min-h-[calc(100vh-65px)]">{children}</div>
        <SiteFooter />
        <SupportWidgetLoader />
      </body>
    </html>
  );
}
