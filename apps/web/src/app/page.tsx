import { Badge, Button, Card, CardDescription, CardTitle } from "@repo/ui";
import Link from "next/link";


export default function HomePage(): JSX.Element {
  return (
    <main className="container-page space-y-14">
      <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-luxury lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Badge>Verified luxury directory</Badge>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight">
            Premium profiles, private messaging, KYC verification, and subscription revenue in one monorepo.
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            RENT WOMAN is structured for high-trust onboarding, paid visibility, moderation workflows, secure media
            uploads, and real-time conversations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/directory">
              <Button>Explore directory</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary">Create profile</Button>
            </Link>
          </div>
        </div>

        <Card className="space-y-4">
          <CardTitle>Platform pillars</CardTitle>
          <CardDescription>KYC, moderation, payments, and real-time chat are wired into the baseline architecture.</CardDescription>
          <ul className="space-y-3 text-sm text-white/70">
            <li>• NextAuth.js v5 + JWT sessions</li>
            <li>• Express REST API + Socket.IO</li>
            <li>• Stripe subscriptions and one-time payments</li>
            <li>• AWS S3 uploads + Rekognition moderation</li>
            <li>• Sumsub onboarding</li>
            <li>• Resend email + Twilio Verify</li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "High-trust onboarding",
            description: "Use Sumsub access tokens and dashboard review states to keep the public catalog verified."
          },
          {
            title: "Monetization-ready",
            description: "Sell monthly tiers, feature boosts, and visibility upgrades through Stripe Checkout."
          },
          {
            title: "Operational safety",
            description: "Moderate media uploads with Rekognition before showing assets publicly."
          }
        ].map((item) => (
          <Card key={item.title}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-3">{item.description}</CardDescription>
          </Card>
        ))}
      </section>
    </main>
  );
}
