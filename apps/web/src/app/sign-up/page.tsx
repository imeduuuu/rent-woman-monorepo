import { prisma } from "@repo/db";
import { Button, Card, Input } from "@repo/ui";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";


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
