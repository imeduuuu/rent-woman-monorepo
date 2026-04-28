import { Router } from "express";
import { z } from "zod";

import { sendFeedback, sendSupportMessage } from "../services/agents-service";

export const supportRouter = Router();

// POST /api/v1/support/message
// Envía un mensaje al AG-1 orquestador y devuelve la respuesta del agente
supportRouter.post("/message", async (request, response, next) => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(1).max(2000),
      country: z.string().length(2).optional(),
      channel: z.enum(["email", "chat", "webhook"]).optional()
    });

    const body = schema.parse(request.body);
    const result = await sendSupportMessage(body);

    response.json({
      data: result ?? { success: true, response: "Tu mensaje ha sido recibido. Te responderemos pronto." },
      error: null
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/support/feedback
// Thumbs up/down en respuesta del agente → AG-7 aprendizaje
supportRouter.post("/feedback", async (request, response, next) => {
  try {
    const schema = z.object({
      caseId: z.string().min(1),
      messageId: z.string().min(1),
      userId: z.string().min(1),
      rating: z.enum(["positive", "negative"]),
      comment: z.string().max(500).optional()
    });

    const body = schema.parse(request.body);
    await sendFeedback(body);

    response.json({ data: { received: true }, error: null });
  } catch (error) {
    next(error);
  }
});
