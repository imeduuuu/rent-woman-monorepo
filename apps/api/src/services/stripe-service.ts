import { prisma } from "@repo/db";
import Stripe from "stripe";

import { env } from "../config/env";
import { notifyPaymentFailed, notifyPaymentSuccess } from "./agents-service";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(input: {
  userId: string;
  email: string;
  priceId: string;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer_email: input.email,
    mode: input.mode,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    line_items: [
      {
        price: input.priceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: input.userId,
      paymentType: input.mode
    }
  });

  await prisma.payment.create({
    data: {
      userId: input.userId,
      amount: 0,
      currency: "EUR",
      paymentType: input.mode,
      stripeCheckoutSessionId: session.id,
      status: "PENDING"
    }
  });

  return session.url ?? input.cancelUrl;
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      return;
    }

    await prisma.payment.updateMany({
      where: {
        stripeCheckoutSessionId: session.id
      },
      data: {
        amount: session.amount_total ?? 0,
        currency: session.currency?.toUpperCase() ?? "EUR",
        status: "SUCCEEDED"
      }
    });

    if (session.mode === "subscription") {
      const plan = session.amount_total && session.amount_total > 5000 ? "ELITE" : "PREMIUM";

      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionPlan: plan }
      });

      // Notificar AG-3 — confirmación + factura PDF
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, profile: { select: { country: true } } } });
      if (user?.email) {
        const previousPayments = await prisma.payment.count({ where: { userId, status: "SUCCEEDED" } });
        void notifyPaymentSuccess({
          userId,
          email: user.email,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "EUR",
          planId: plan.toLowerCase(),
          invoiceId: session.id,
          country: user.profile?.country ?? "ES",
          isFirstPayment: previousPayments <= 1
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata?.userId;

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "FAILED" }
    });

    // Notificar AG-3 — secuencia recuperación de pago
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, profile: { select: { country: true } } } });
      if (user?.email) {
        void notifyPaymentFailed({
          userId,
          email: user.email,
          country: user.profile?.country ?? "ES",
          errorCode: paymentIntent.last_payment_error?.code ?? undefined,
          errorMessage: paymentIntent.last_payment_error?.message ?? undefined
        });
      }
    }
  }
}
