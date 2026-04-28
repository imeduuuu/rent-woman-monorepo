import { Card } from "@repo/ui";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AvailabilityToggle } from "@/components/availability-toggle";

export default async function AvailabilityPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-white/40 hover:text-white">← Dashboard</Link>
        <h1 className="mt-1 text-2xl font-semibold text-white">Disponible ahora</h1>
        <p className="mt-1 text-sm text-white/40">Activa tu disponibilidad para que los clientes vean el punto verde en tu perfil.</p>
      </div>

      <AvailabilityToggle />

      <Card>
        <p className="text-sm text-white/40">Cuando estás disponible, aparece un indicador verde en tu tarjeta del directorio. Se desactiva automáticamente después de 8 horas.</p>
      </Card>
    </main>
  );
}
