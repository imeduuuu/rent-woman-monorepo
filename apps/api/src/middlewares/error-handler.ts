import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../lib/http-errors";

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({
      data: null,
      error: error.message
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    data: null,
    error: "Internal server error"
  });
}
