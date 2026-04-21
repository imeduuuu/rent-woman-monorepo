import { Router } from "express";
import { z } from "zod";

import { generateSumsubAccessToken } from "../services/kyc-service";

export const kycRouter = Router();

kycRouter.post("/access-token", async (request, response, next) => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      levelName: z.string().optional()
    });

    const body = schema.parse(request.body);
    const result = await generateSumsubAccessToken(body);

    response.status(201).json({
      data: result,
      error: null
    });
  } catch (error) {
    next(error);
  }
});
