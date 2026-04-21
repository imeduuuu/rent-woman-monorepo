import { Router } from "express";
import { z } from "zod";

import { createSignedUploadUrl } from "../services/storage-service";

export const storageRouter = Router();

storageRouter.post("/presign", async (request, response, next) => {
  try {
    const schema = z.object({
      fileName: z.string().min(1),
      contentType: z.string().min(1)
    });

    const body = schema.parse(request.body);
    const result = await createSignedUploadUrl(body.fileName, body.contentType);

    response.status(201).json({
      data: result,
      error: null
    });
  } catch (error) {
    next(error);
  }
});
