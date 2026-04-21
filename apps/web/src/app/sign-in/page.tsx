import { Button, Card, Input } from "@repo/ui";
import Link from "next/link";

import { signIn } from "@/auth";


export default function SignInPage(): JSX.Element {
  async function credentialsAction(formData: FormData): Promise<void> {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard"
    });
  }

  async function googleAction(): Promise<void> {
    "use server";

    await signIn("google", {
      redirectTo: "/dashboard"
    });
  }

  return (
    <main className="container-page flex justify-center">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-white/60">Access your dashboard, messages, uploads, and subscriptions.</p>
        </div>

        <form action={credentialsAction} className="space-y-4">
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="password" placeholder="Password" required type="password" />
          <Button className="w-full" type="submit">
            Continue with email
          </Button>
        </form>

        {process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? (
          <form action={googleAction}>
            <Button className="w-full" type="submit" variant="secondary">
              Continue with Google
            </Button>
          </form>
        ) : null}

        <Link className="text-sm text-white/60 underline" href="/sign-up">
          Need an account?
        </Link>
      </Card>
    </main>
  );
}
