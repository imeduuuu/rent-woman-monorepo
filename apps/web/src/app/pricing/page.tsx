import { Badge, Button, Card, CardDescription, CardTitle } from "@repo/ui";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { env } from "@/lib/env";

const plans = [
  {
    name: "Premium",
    description: "Visibilidad mejorada, mayor límite de mensajes y herramientas de perfil avanzadas.",
    price: "150",
    priceId: env.STRIPE_PRICE_PREMIUM_MONTHLY,
    mode: "subscription" as const
  },
  {
    name: "Elite",
    description: "Máxima exposición, destacados VIP en el directorio y soporte prioritario 24/7.",
    price: "300",
    priceId: env.STRIPE_PRICE_ELITE_MONTHLY,
    mode: "subscription" as const,
    featured: true
  },
  {
    name: "Spotlight Boost",
    description: "Destaque puntual durante 24h para aparecer primero en tu ciudad.",
    price: "50",
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
    <main className="container-page space-y-12 py-16">
      <div className="text-center space-y-4">
        <h1 className="font-display text-display-l text-white">Planes y visibilidad</h1>
        <p className="mx-auto max-w-2xl text-body-l text-rw-white-75 font-light">
          Maximiza tu exposición y gestiona tus reservas con las herramientas premium de nuestro directorio.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="relative">
            {plan.featured && (
              <div className="absolute -top-3 inset-x-0 flex justify-center z-10">
                <Badge variant="vip">Recomendado</Badge>
              </div>
            )}
            <Card 
              className={`h-full flex flex-col justify-between space-y-8 ${plan.featured ? 'border-rw-pink-border bg-rw-black-200 shadow-none' : ''}`}
            >
              <div className="space-y-4">
                <CardTitle className="text-center">{plan.name}</CardTitle>
                <div className="text-center">
                  <span className="font-display text-[48px] font-semibold leading-none text-rw-pink">
                    €{plan.price}
                  </span>
                  <span className="text-body-s text-rw-white-45 ml-1">
                    {plan.mode === 'subscription' ? '/mes' : '/vez'}
                  </span>
                </div>
                <CardDescription className="text-center mt-4">
                  {plan.description}
                </CardDescription>
              </div>

              <form action={checkoutAction}>
                <input name="priceId" type="hidden" value={plan.priceId} />
                <input name="mode" type="hidden" value={plan.mode} />
                <Button 
                  className="w-full" 
                  type="submit" 
                  variant={plan.featured ? "primary" : "secondary"}
                >
                  Continuar
                </Button>
              </form>
            </Card>
          </div>
        ))}
      </div>
    </main>
  );
}
