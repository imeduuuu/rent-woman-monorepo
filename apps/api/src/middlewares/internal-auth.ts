import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

export function requireInternalApiKey(request: Request, response: Response, next: NextFunction): void {
  const providedKey = request.header("x-internal-api-key");

  if (providedKey !== env.INTERNAL_API_KEY) {
    response.status(401).json({
      data: null,
      error: "Unauthorized"
    });
    return;
  }

  next();
}
