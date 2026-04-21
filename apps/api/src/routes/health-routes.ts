import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    data: {
      ok: true,
      service: "api"
    },
    error: null
  });
});
