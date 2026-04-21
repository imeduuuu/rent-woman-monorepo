import { Router } from "express";
import { z } from "zod";

import { reviewMediaAsset } from "../services/moderation-service";

export const moderationRouter = Router();

moderationRouter.post("/review", async (request, response, next) => {
  try {
    const schema = z.object({
      mediaAssetId: z.string().min(1),
      storageKey: z.string().min(1)
    });

    const body = schema.parse(request.body);
    const result = await reviewMediaAsset(body.mediaAssetId, body.storageKey);

    response.status(201).json({
      data: result,
      error: null
    });
  } catch (error) {
    next(error);
  }
});
