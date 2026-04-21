import { Router } from "express";
import { z } from "zod";

import { createCheckoutSession } from "../services/stripe-service";

export const paymentRouter = Router();

paymentRouter.post("/checkout-session", async (request, response, next) => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      email: z.string().email(),
      priceId: z.string().min(1),
      mode: z.enum(["subscription", "payment"]),
      successUrl: z.string().url(),
      cancelUrl: z.string().url()
    });

    const body = schema.parse(request.body);
    const checkoutUrl = await createCheckoutSession(body);

    response.status(201).json({
      data: {
        checkoutUrl
      },
      error: null
    });
  } catch (error) {
    next(error);
  }
});

