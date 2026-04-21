import type { Server as HttpServer } from "node:http";

import { prisma } from "@repo/db";
import type {
  CallAnswerPayload,
  CallControlPayload,
  CallIceCandidatePayload,
  CallOfferPayload,
  WebRtcIceCandidate,
  WebRtcSessionDescription
} from "@repo/types";
import { Server } from "socket.io";

import { env } from "../config/env";
import { verifySocketToken } from "../lib/socket-auth";

interface SocketAuthPayload {
  userId: string;
  token: string;
  expiresAt?: number;
}

interface ConversationPayload {
  conversationId: string;
}

interface MessagePayload extends ConversationPayload {
  body: string;
}

interface ClientCallOfferPayload extends ConversationPayload {
  sdp: WebRtcSessionDescription;
}

interface ClientCallAnswerPayload extends ConversationPayload {
  sdp: WebRtcSessionDescription;
}

interface ClientCallIceCandidatePayload extends ConversationPayload {
  candidate: WebRtcIceCandidate;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isSessionDescription(value: unknown): value is WebRtcSessionDescription {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const type = payload.type;

  return (
    (type === "offer" || type === "answer" || type === "pranswer" || type === "rollback") &&
    isNonEmptyString(payload.sdp)
  );
}

function isIceCandidate(value: unknown): value is WebRtcIceCandidate {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    isNonEmptyString(payload.candidate) &&
    (payload.sdpMid === null || typeof payload.sdpMid === "string") &&
    (payload.sdpMLineIndex === null || typeof payload.sdpMLineIndex === "number") &&
    (payload.usernameFragment === null || typeof payload.usernameFragment === "string")
  );
}

function isConversationPayload(value: unknown): value is ConversationPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return isNonEmptyString(payload.conversationId);
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.NEXT_PUBLIC_APP_URL,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const auth = socket.handshake.auth as SocketAuthPayload;
    const userId = auth.userId;
    const token = auth.token;
    const expiresAt = auth.expiresAt;

    if (!userId || !token || !expiresAt) {
      next(new Error("Unauthorized"));
      return;
    }

    if (!verifySocketToken(userId, expiresAt, token)) {
      next(new Error("Unauthorized"));
      return;
    }

    socket.data.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    socket.on("conversation:join", async (payload: ConversationPayload) => {
      if (!isConversationPayload(payload)) {
        return;
      }

      await socket.join(payload.conversationId);
    });

    socket.on("message:send", async (payload: MessagePayload) => {
      if (!isConversationPayload(payload) || !isNonEmptyString(payload.body)) {
        return;
      }

      const senderId = socket.data.userId as string;

      const message = await prisma.message.create({
        data: {
          conversationId: payload.conversationId,
          senderId,
          body: payload.body
        }
      });

      io.to(payload.conversationId).emit("message:new", {
        message: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          body: message.body,
          createdAt: message.createdAt.toISOString()
        }
      });
    });

    socket.on("call:offer", (payload: ClientCallOfferPayload) => {
      if (!isConversationPayload(payload) || !isSessionDescription(payload.sdp)) {
        return;
      }

      const fromUserId = socket.data.userId as string;

      const eventPayload: CallOfferPayload = {
        conversationId: payload.conversationId,
        fromUserId,
        sdp: payload.sdp
      };

      socket.to(payload.conversationId).emit("call:offer", eventPayload);
    });

    socket.on("call:answer", (payload: ClientCallAnswerPayload) => {
      if (!isConversationPayload(payload) || !isSessionDescription(payload.sdp)) {
        return;
      }

      const fromUserId = socket.data.userId as string;

      const eventPayload: CallAnswerPayload = {
        conversationId: payload.conversationId,
        fromUserId,
        sdp: payload.sdp
      };

      socket.to(payload.conversationId).emit("call:answer", eventPayload);
    });

    socket.on("call:ice-candidate", (payload: ClientCallIceCandidatePayload) => {
      if (!isConversationPayload(payload) || !isIceCandidate(payload.candidate)) {
        return;
      }

      const fromUserId = socket.data.userId as string;

      const eventPayload: CallIceCandidatePayload = {
        conversationId: payload.conversationId,
        fromUserId,
        candidate: payload.candidate
      };

      socket.to(payload.conversationId).emit("call:ice-candidate", eventPayload);
    });

    socket.on("call:end", (payload: ConversationPayload) => {
      if (!isConversationPayload(payload)) {
        return;
      }

      const fromUserId = socket.data.userId as string;

      const eventPayload: CallControlPayload = {
        conversationId: payload.conversationId,
        fromUserId
      };

      socket.to(payload.conversationId).emit("call:end", eventPayload);
    });

    socket.on("call:reject", (payload: ConversationPayload) => {
      if (!isConversationPayload(payload)) {
        return;
      }

      const fromUserId = socket.data.userId as string;

      const eventPayload: CallControlPayload = {
        conversationId: payload.conversationId,
        fromUserId
      };

      socket.to(payload.conversationId).emit("call:reject", eventPayload);
    });
  });

  return io;
}
