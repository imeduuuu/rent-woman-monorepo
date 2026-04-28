import { SupportWidget } from "./support-widget";

import { auth } from "@/auth";

export async function SupportWidgetLoader(): Promise<JSX.Element | null> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return (
    <SupportWidget
      userId={session.user.id}
      userEmail={session.user.email}
      userName={session.user.name}
    />
  );
}
