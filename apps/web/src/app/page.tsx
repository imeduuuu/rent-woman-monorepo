import { Badge, Button, Card, CardDescription, CardTitle } from "@repo/ui";
import Link from "next/link";

export default function HomePage(): JSX.Element {
  return (
    <main className="container-page space-y-20 py-16">
      <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="ghost">Directorio premium verificado</Badge>
          <h1 className="font-display text-display-xl text-white">
            Encuentros exclusivos. <br />
            Privacidad absoluta.
          </h1>
          <p className="max-w-2xl text-body-l text-rw-white-75 font-light">
            Explora perfiles verificados con disponibilidad en tiempo real. 
            Reserva con seguridad y comunícate directamente a través de nuestro sistema cifrado.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/directory">
              <Button size="lg">Explorar directorio</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary">Crear perfil</Button>
            </Link>
          </div>
        </div>

        <Card className="space-y-6">
          <CardTitle>Pilares de la plataforma</CardTitle>
          <CardDescription>
            Seguridad y discreción en cada paso del proceso de reserva y comunicación.
          </CardDescription>
          <ul className="space-y-4 text-body-m text-rw-white-75">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-rw-pink" />
              <span>Verificación KYC obligatoria para cada perfil.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-rw-pink" />
              <span>Pagos seguros y discretos procesados por Stripe.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-rw-pink" />
              <span>Mensajería interna en tiempo real (Socket.io).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-rw-pink" />
              <span>Moderación de contenido automatizada.</span>
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Verificación de identidad",
            description: "Todos los perfiles pasan por un riguroso proceso de verificación biométrica para asegurar su autenticidad."
          },
          {
            title: "Reservas directas",
            description: "Visualiza calendarios en tiempo real y realiza tu reserva sin intermediarios."
          },
          {
            title: "Mensajería privada",
            description: "Comunícate de forma directa y segura antes de confirmar tu encuentro."
          }
        ].map((item) => (
          <Card key={item.title}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-3">{item.description}</CardDescription>
          </Card>
        ))}
      </section>
    </main>
  );
}
