import { env } from "../config/env";

export class AgentService {
  private static async dispatch(endpoint: string, payload: Record<string, any>) {
    if (!env.N8N_BASE_URL || !env.AGENTS_INTERNAL_TOKEN) {
      console.warn(`[AgentService] n8n configuration missing, skipping dispatch to ${endpoint}`);
      return;
    }

    try {
      const response = await fetch(`${env.N8N_BASE_URL}/webhook/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": env.AGENTS_INTERNAL_TOKEN,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[AgentService] Failed to dispatch to ${endpoint}:`, error);
    }
  }

  static async notifyNewUser(user: { id: string; email: string; name?: string; country?: string }) {
    return this.dispatch("new-user", {
      event: "new_user",
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0],
      country: user.country || "ES",
      language: "es",
      plan: "free",
      registeredAt: new Date().toISOString(),
    });
  }

  static async notifyPaymentSuccess(intent: any) {
    return this.dispatch("payment-success", {
      event: "payment_success",
      userId: intent.metadata?.userId,
      email: intent.metadata?.email,
      amount: intent.amount / 100,
      currency: intent.currency?.toUpperCase(),
      planId: intent.metadata?.planId,
      invoiceId: intent.id,
      country: intent.metadata?.country || "ES",
      isFirstPayment: intent.metadata?.isFirstPayment === "true",
    });
  }

  static async notifyPaymentFailed(intent: any) {
    return this.dispatch("payment-failed", {
      event: "payment_failed",
      userId: intent.metadata?.userId,
      email: intent.metadata?.userEmail,
      country: intent.metadata?.country || "ES",
      errorCode: intent.last_payment_error?.code,
      errorMessage: intent.last_payment_error?.message,
      attemptCount: intent.metadata?.attemptCount || 1,
      updatePaymentUrl: `${env.NEXT_PUBLIC_APP_URL}/billing/update`,
    });
  }

  static async sendCustomerSupportMessage(user: any, messageText: string, channel: string = "chat") {
    return this.dispatch("customer-support", {
      event: "support_message",
      userId: user.id,
      email: user.email,
      message: messageText,
      channel,
      country: user.country || "ES",
      metadata: {},
    });
  }

  static async sendFeedback(caseId: string, messageId: string, userId: string, rating: "positive" | "negative", comment?: string) {
    return this.dispatch("feedback", {
      caseId,
      messageId,
      userId,
      rating,
      comment,
    });
  }
}
