import { Button, Card, CardDescription, CardTitle } from "@repo/ui";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/env";

const plans = [
  {
    name: "Premium",
    description: "Monthly tier for stronger placement, messaging limits, and richer profile tools.",
    priceId: env.STRIPE_PRICE_PREMIUM_MONTHLY,
    mode: "subscription" as const
  },
  {
    name: "Elite",
    description: "Best placement, featured visibility, and advanced profile controls.",
    priceId: env.STRIPE_PRICE_ELITE_MONTHLY,
    mode: "subscription" as const
  },
  {
    name: "Spotlight Boost",
    description: "One-time featured boost for a short visibility window.",
    priceId: env.STRIPE_PRICE_ONE_TIME_SPOTLIGHT,
    mode: "payment" as const
  }
];

export default function PricingPage(): JSX.Element {
  async function checkoutAction(formData: FormData): Promise<void> {
    "use server";

    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      redirect("/sign-in");
    }

    const priceId = String(formData.get("priceId") ?? "");
    const mode = String(formData.get("mode") ?? "subscription");

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/payments/checkout-session`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": env.INTERNAL_API_KEY
      },
      body: JSON.stringify({
        userId: session.user.id,
        email: session.user.email,
        priceId,
        mode,
        successUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        cancelUrl: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session.");
    }

    const payload = (await response.json()) as { data: { checkoutUrl: string } };

    redirect(payload.data.checkoutUrl);
  }

  return (
    <main className="container-page space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">Pricing</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Use Stripe Checkout for recurring plans and one-time visibility upgrades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="space-y-6">
            <div>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </div>

            <form action={checkoutAction}>
              <input name="priceId" type="hidden" value={plan.priceId} />
              <input name="mode" type="hidden" value={plan.mode} />
              <Button className="w-full" type="submit">
                Continue
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </main>
  );
}
