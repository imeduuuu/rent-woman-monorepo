import { Card, CardDescription, CardTitle } from "@repo/ui";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SumsubWidget } from "@/components/sumsub-widget";
import { env } from "@/lib/env";

export default async function VerificationPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    redirect("/sign-in");
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/kyc/access-token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-api-key": env.INTERNAL_API_KEY
    },
    body: JSON.stringify({
      userId: session.user.id,
      email: session.user.email,
      levelName: process.env.SUMSUB_LEVEL_NAME ?? "basic-kyc-level"
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to generate Sumsub access token.");
  }

  const payload = (await response.json()) as { data: { token: string } };

  return (
    <main className="container-page space-y-6">
      <Card>
        <CardTitle>Identity verification</CardTitle>
        <CardDescription className="mt-2">
          The widget below uses a backend-issued Sumsub access token and should be embedded only for authenticated users.
        </CardDescription>
      </Card>

      <SumsubWidget accessToken={payload.data.token} />
    </main>
  );
}
