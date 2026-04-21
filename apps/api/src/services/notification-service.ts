import { Resend } from "resend";
import twilio from "twilio";

import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);
const twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html
  });
}

export async function startPhoneVerification(phone: string): Promise<void> {
  await twilioClient.verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
    channel: "sms",
    to: phone
  });
}

export async function checkPhoneVerification(phone: string, code: string): Promise<boolean> {
  const verificationCheck = await twilioClient.verify.v2
    .services(env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phone,
      code
    });

  return verificationCheck.status === "approved";
}
