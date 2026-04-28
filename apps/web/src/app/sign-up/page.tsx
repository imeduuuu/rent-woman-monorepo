import { prisma } from "@repo/db";
import { Button, Card, Input } from "@repo/ui";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";

async function notifyAgentNewUser(params: { userId: string; email: string; name: string }): Promise<void> {
  if (!env.N8N_BASE_URL || !env.AGENTS_INTERNAL_TOKEN) return;
  try {
    await fetch(`${env.N8N_BASE_URL}/webhook/new-user`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-token": env.AGENTS_INTERNAL_TOKEN },
      body: JSON.stringify({
        event: "new_user",
        userId: params.userId,
        email: params.email,
        name: params.name,
        country: "ES",
        language: "es",
        plan: "free",
        registeredAt: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    // No bloquear el registro si los agentes no están disponibles
  }
}


export default function SignUpPage(): JSX.Element {
  async function createAccount(formData: FormData): Promise<void> {
    "use server";

    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "").toLowerCase();
    const password = String(formData.get("password") ?? "");

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "TALENT",
        profile: {
          create: {
            isPublic: false
          }
        }
      }
    });

    // Notificar AG-2 — email de bienvenida (fire & forget)
    void notifyAgentNewUser({ userId: newUser.id, email: newUser.email ?? "", name: newUser.name ?? name });

    redirect("/sign-in");
  }

  return (
    <main className="container-page flex justify-center">
      <Card className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Apply for a profile</h1>
          <p className="mt-2 text-sm text-white/60">
            Create your account first, then complete verification, uploads, and pricing inside the dashboard.
          </p>
        </div>

        <form action={createAccount} className="space-y-4">
          <Input name="name" placeholder="Full name" required />
          <Input name="email" placeholder="Email" required type="email" />
          <Input minLength={10} name="password" placeholder="Password" required type="password" />
          <Button className="w-full" type="submit">
            Create account
          </Button>
        </form>
      </Card>
    </main>
  );
}
