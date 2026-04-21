import { Router } from "express";
import { z } from "zod";

import { checkPhoneVerification, sendTransactionalEmail, startPhoneVerification } from "../services/notification-service";

export const notificationRouter = Router();

notificationRouter.post("/email", async (request, response, next) => {
  try {
    const schema = z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      html: z.string().min(1)
    });

    const body = schema.parse(request.body);
    await sendTransactionalEmail(body);

    response.status(201).json({
      data: { sent: true },
      error: null
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.post("/sms/start", async (request, response, next) => {
  try {
    const schema = z.object({
      phone: z.string().min(6)
    });

    const body = schema.parse(request.body);
    await startPhoneVerification(body.phone);

    response.status(201).json({
      data: { sent: true },
      error: null
    });
  } catch (error) {
    next(error);
  }
});

notificationRouter.post("/sms/check", async (request, response, next) => {
  try {
    const schema = z.object({
      phone: z.string().min(6),
      code: z.string().min(4)
    });

    const body = schema.parse(request.body);
    const approved = await checkPhoneVerification(body.phone, body.code);

    response.status(200).json({
      data: { approved },
      error: null
    });
  } catch (error) {
    next(error);
  }
});
