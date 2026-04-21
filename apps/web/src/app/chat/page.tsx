import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChatClient } from "@/components/chat-client";

export default async function ChatPage(): Promise<JSX.Element> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <main className="container-page space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Messages</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Real-time chat is backed by Socket.IO on the Express API and uses a short-lived HMAC token from Next.js.
        </p>
      </div>

      <ChatClient />
    </main>
  );
}
