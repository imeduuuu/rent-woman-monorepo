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
    <main className="container-page flex min-h-[calc(100vh-64px)] flex-col items-center justify-center py-12">
      <Card className="w-full max-w-[400px] space-y-8 p-8">
        <div className="text-center">
          <h1 className="font-display text-display-m text-white">Acceder</h1>
          <p className="mt-2 text-body-m text-rw-white-75">
            Gestiona tu perfil, reservas y mensajes privados.
          </p>
        </div>

        <form action={credentialsAction} className="space-y-4">
          <Input name="email" placeholder="Email" required type="email" />
          <Input name="password" placeholder="Contraseña" required type="password" />
          <Button className="w-full mt-2" type="submit" size="lg">
            Continuar con email
          </Button>
        </form>

        {process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? (
          <form action={googleAction}>
            <Button className="w-full" type="submit" variant="secondary" size="lg">
              Continuar con Google
            </Button>
          </form>
        ) : null}

        <div className="text-center pt-2">
          <Link className="text-body-s text-rw-white-75 hover:text-white hover:underline transition-colors" href="/sign-up">
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </Card>
    </main>
  );
}
