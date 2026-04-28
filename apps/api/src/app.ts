import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { errorHandler } from "./middlewares/error-handler";
import { requireInternalApiKey } from "./middlewares/internal-auth";
import { healthRouter } from "./routes/health-routes";
import { kycRouter } from "./routes/kyc-routes";
import { listingRouter } from "./routes/listing-routes";
import { moderationRouter } from "./routes/moderation-routes";
import { notificationRouter } from "./routes/notification-routes";
import { paymentRouter } from "./routes/payment-routes";
import { storageRouter } from "./routes/storage-routes";
import { supportRouter } from "./routes/support-routes";
import { handleStripeWebhook } from "./services/stripe-service";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.NEXT_PUBLIC_APP_URL,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(morgan("combined"));

  app.use("/health", healthRouter);
  app.use("/api/v1/listings", express.json(), listingRouter);

  app.post("/api/v1/payments/stripe/webhook", express.raw({ type: "application/json" }), async (request, response, next) => {
    try {
      const signature = request.header("stripe-signature");

      if (!signature || !Buffer.isBuffer(request.body)) {
        response.status(400).json({
          data: null,
          error: "Missing Stripe signature or raw body"
        });
        return;
      }

      await handleStripeWebhook(request.body, signature);

      response.json({
        data: { received: true },
        error: null
      });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/v1/payments", express.json(), requireInternalApiKey, paymentRouter);
  app.use("/api/v1/storage", express.json(), requireInternalApiKey, storageRouter);
  app.use("/api/v1/kyc", express.json(), requireInternalApiKey, kycRouter);
  app.use("/api/v1/moderation", express.json(), requireInternalApiKey, moderationRouter);
  app.use("/api/v1/notifications", express.json(), requireInternalApiKey, notificationRouter);
  app.use("/api/v1/support", express.json(), requireInternalApiKey, supportRouter);

  app.use(errorHandler);

  return app;
}
