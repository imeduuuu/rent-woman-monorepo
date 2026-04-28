/**
 * agents-service.ts
 * Comunicación con el sistema de 7 agentes n8n.
 * Todos los webhooks llevan X-Internal-Token para autenticación.
 */

import { env } from "../config/env";

interface AgentsResponse {
  success: boolean;
  caseId?: string;
  messageId?: string;
  response?: string;
  escalated?: boolean;
  estimatedResponseTime?: string;
  delegatedTo?: string;
}

async function callAgent(path: string, body: Record<string, unknown>): Promise<AgentsResponse | null> {
  if (!env.N8N_BASE_URL || !env.AGENTS_INTERNAL_TOKEN) {
    console.warn("[agents] N8N_BASE_URL or AGENTS_INTERNAL_TOKEN not configured — skipping agent call.");
    return null;
  }

  try {
    const response = await fetch(`${env.N8N_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": env.AGENTS_INTERNAL_TOKEN
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000) // 10s timeout — no bloquear el flujo principal
    });

    if (!response.ok) {
      console.error(`[agents] Webhook ${path} returned ${response.status}`);
      return null;
    }

    return (await response.json()) as AgentsResponse;
  } catch (error) {
    console.error(`[agents] Failed to call ${path}:`, error);
    return null;
  }
}

// ─── Agente 2 — Nuevo usuario ────────────────────────────────────────────────

export async function notifyNewUser(params: {
  userId: string;
  email: string;
  name: string | null;
  country?: string;
  language?: string;
  plan?: string;
  registeredAt: Date;
}): Promise<void> {
  await callAgent("/webhook/new-user", {
    event: "new_user",
    userId: params.userId,
    email: params.email,
    name: params.name ?? params.email.split("@")[0],
    country: params.country ?? "ES",
    language: params.language ?? "es",
    plan: params.plan ?? "free",
    registeredAt: params.registeredAt.toISOString()
  });
}

// ─── Agente 3 — Pago completado ──────────────────────────────────────────────

export async function notifyPaymentSuccess(params: {
  userId: string;
  email: string;
  amount: number;
  currency: string;
  planId: string;
  invoiceId: string;
  country?: string;
  isFirstPayment?: boolean;
}): Promise<void> {
  await callAgent("/webhook/payment-success", {
    event: "payment_success",
    userId: params.userId,
    email: params.email,
    amount: params.amount,
    currency: params.currency.toUpperCase(),
    planId: params.planId,
    invoiceId: params.invoiceId,
    country: params.country ?? "ES",
    isFirstPayment: params.isFirstPayment ?? false
  });
}

// ─── Agente 3 — Pago fallido ─────────────────────────────────────────────────

export async function notifyPaymentFailed(params: {
  userId: string;
  email: string;
  country?: string;
  errorCode?: string;
  errorMessage?: string;
  attemptCount?: number;
}): Promise<void> {
  await callAgent("/webhook/payment-failed", {
    event: "payment_failed",
    userId: params.userId,
    email: params.email,
    country: params.country ?? "ES",
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    attemptCount: params.attemptCount ?? 1,
    updatePaymentUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
  });
}

// ─── Agente 1 — Mensaje de soporte ──────────────────────────────────────────

export async function sendSupportMessage(params: {
  userId: string;
  email: string;
  message: string;
  country?: string;
  channel?: "email" | "chat" | "webhook";
}): Promise<AgentsResponse | null> {
  return callAgent("/webhook/customer-support", {
    event: "support_message",
    userId: params.userId,
    email: params.email,
    message: params.message,
    country: params.country ?? "ES",
    channel: params.channel ?? "chat",
    metadata: {}
  });
}

// ─── Feedback thumbs up/down ─────────────────────────────────────────────────

export async function sendFeedback(params: {
  caseId: string;
  messageId: string;
  userId: string;
  rating: "positive" | "negative";
  comment?: string;
}): Promise<void> {
  await callAgent("/webhook/feedback", {
    caseId: params.caseId,
    messageId: params.messageId,
    userId: params.userId,
    rating: params.rating,
    comment: params.comment ?? null
  });
}
