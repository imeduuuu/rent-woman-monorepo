"use client";

import type {
  CallAnswerPayload,
  CallControlPayload,
  CallIceCandidatePayload,
  CallOfferPayload,
  ChatMessage,
  SocketTokenResponse,
  WebRtcIceCandidate,
  WebRtcSessionDescription
} from "@repo/types";
import { Button, Card, Input } from "@repo/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface RealtimeMessageEvent {
  message: ChatMessage;
}

type CallState = "idle" | "calling" | "ringing" | "in-call";

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    {
      urls: process.env.NEXT_PUBLIC_STUN_URL ?? "stun:stun.l.google.com:19302"
    }
  ];

  if (process.env.NEXT_PUBLIC_TURN_URL) {
    servers.push({
      urls: process.env.NEXT_PUBLIC_TURN_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME,
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
    });
  }

  return servers;
}

function toSessionDescription(session: WebRtcSessionDescription): RTCSessionDescriptionInit {
  return {
    type: session.type,
    sdp: session.sdp
  };
}

export function ChatClient(): JSX.Element {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [body, setBody] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [incomingCall, setIncomingCall] = useState<CallOfferPayload | null>(null);
  const [activeCallConversationId, setActiveCallConversationId] = useState<string | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);

  const activeCallConversationIdRef = useRef<string | null>(null);
  const resetCallLocallyRef = useRef<() => void>(() => {});
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const iceServers = useMemo(buildIceServers, []);

  const roomIsReady = useMemo(() => conversationId.trim().length > 10, [conversationId]);

  function detachRemoteAudio(): void {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }

  function stopLocalStream(): void {
    if (!localStreamRef.current) {
      return;
    }

    localStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    localStreamRef.current = null;

    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
  }

  function destroyPeerConnection(): void {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }

  function resetCallLocally(): void {
    destroyPeerConnection();
    stopLocalStream();
    detachRemoteAudio();
    setIncomingCall(null);
    setActiveCallConversationId(null);
    setCallState("idle");
  }

  resetCallLocallyRef.current = resetCallLocally;

  function endCall(notifyPeer: boolean): void {
    if (notifyPeer && socket) {
      const currentConversationId = activeCallConversationIdRef.current ?? conversationId.trim();

      if (currentConversationId.length > 0) {
        socket.emit("call:end", {
          conversationId: currentConversationId
        });
      }
    }

    resetCallLocally();
    setCallNotice("Call ended.");
  }

  async function getLocalAudioStream(): Promise<MediaStream> {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });

    localStreamRef.current = stream;

    if (localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
    }

    return stream;
  }

  function createPeerConnection(targetConversationId: string): RTCPeerConnection {
    destroyPeerConnection();

    const peerConnection = new RTCPeerConnection({
      iceServers
    });

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socket) {
        return;
      }

      const candidate = event.candidate.toJSON();
      const payload: WebRtcIceCandidate = {
        candidate: candidate.candidate ?? "",
        sdpMid: candidate.sdpMid ?? null,
        sdpMLineIndex: candidate.sdpMLineIndex ?? null,
        usernameFragment: candidate.usernameFragment ?? null
      };

      if (!payload.candidate) {
        return;
      }

      socket.emit("call:ice-candidate", {
        conversationId: targetConversationId,
        candidate: payload
      });
    };

    peerConnection.ontrack = (event) => {
      const [stream] = event.streams;

      if (!stream || !remoteAudioRef.current) {
        return;
      }

      remoteAudioRef.current.srcObject = stream;
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (state === "connected") {
        setCallState("in-call");
        setCallNotice("Call connected.");
        return;
      }

      if (state === "failed" || state === "disconnected" || state === "closed") {
        resetCallLocally();
      }
    };

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  }

  useEffect(() => {
    let activeSocket: Socket | null = null;

    async function connect(): Promise<void> {
      const response = await fetch("/api/realtime/token");
      if (!response.ok) {
        return;
      }

      const tokenPayload = (await response.json()) as SocketTokenResponse;

      activeSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
        auth: {
          userId: tokenPayload.userId,
          token: tokenPayload.token,
          expiresAt: tokenPayload.expiresAt
        }
      });

      activeSocket.on("message:new", (payload: RealtimeMessageEvent) => {
      setMessages((previous) => [...previous, payload.message]);
      });

      activeSocket.on("call:offer", (payload: CallOfferPayload) => {
        setIncomingCall(payload);
        setActiveCallConversationId(payload.conversationId);
        setCallState("ringing");
        setCallNotice(`Incoming call from ${payload.fromUserId}.`);
      });

      activeSocket.on("call:answer", async (payload: CallAnswerPayload) => {
        const peerConnection = peerConnectionRef.current;

        if (!peerConnection || payload.conversationId !== activeCallConversationIdRef.current) {
          return;
        }

        await peerConnection.setRemoteDescription(toSessionDescription(payload.sdp));
        setCallState("in-call");
        setCallNotice("Call connected.");
      });

      activeSocket.on("call:ice-candidate", async (payload: CallIceCandidatePayload) => {
        const peerConnection = peerConnectionRef.current;

        if (!peerConnection || payload.conversationId !== activeCallConversationIdRef.current) {
          return;
        }

        try {
          await peerConnection.addIceCandidate({
            candidate: payload.candidate.candidate,
            sdpMid: payload.candidate.sdpMid ?? undefined,
            sdpMLineIndex: payload.candidate.sdpMLineIndex ?? undefined,
            usernameFragment: payload.candidate.usernameFragment ?? undefined
          });
        } catch {
          // Ignore invalid or out-of-order ICE candidates
        }
      });

      activeSocket.on("call:end", (_payload: CallControlPayload) => {
        resetCallLocallyRef.current();
        setCallNotice("The other user ended the call.");
      });

      activeSocket.on("call:reject", (_payload: CallControlPayload) => {
        resetCallLocallyRef.current();
        setCallNotice("Call declined by the other user.");
      });

      setSocket(activeSocket);
    }

    void connect();

    return () => {
      destroyPeerConnection();
      stopLocalStream();
      detachRemoteAudio();
      activeSocket?.disconnect();
    };
  }, []);

  useEffect(() => {
    activeCallConversationIdRef.current = activeCallConversationId;
  }, [activeCallConversationId]);

  function joinConversation(): void {
    if (!socket || !roomIsReady) {
      return;
    }

    socket.emit("conversation:join", { conversationId });
  }

  function sendMessage(): void {
    if (!socket || !roomIsReady || !body.trim()) {
      return;
    }

    socket.emit("message:send", {
      conversationId,
      body
    });

    setBody("");
  }

  async function startCall(): Promise<void> {
    if (!socket || !roomIsReady) {
      return;
    }

    const currentConversationId = conversationId.trim();

    try {
      socket.emit("conversation:join", {
        conversationId: currentConversationId
      });

      const stream = await getLocalAudioStream();
      const peerConnection = createPeerConnection(currentConversationId);

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const payload: WebRtcSessionDescription = {
        type: offer.type,
        sdp: offer.sdp ?? ""
      };

      socket.emit("call:offer", {
        conversationId: currentConversationId,
        sdp: payload
      });

      setActiveCallConversationId(currentConversationId);
      setCallState("calling");
      setCallNotice("Calling...");
    } catch {
      resetCallLocally();
      setCallNotice("Unable to start call. Check mic permissions.");
    }
  }

  async function acceptIncomingCall(): Promise<void> {
    if (!socket || !incomingCall) {
      return;
    }

    try {
      setConversationId(incomingCall.conversationId);

      socket.emit("conversation:join", {
        conversationId: incomingCall.conversationId
      });

      const stream = await getLocalAudioStream();
      const peerConnection = createPeerConnection(incomingCall.conversationId);

      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      await peerConnection.setRemoteDescription(toSessionDescription(incomingCall.sdp));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      const payload: WebRtcSessionDescription = {
        type: answer.type,
        sdp: answer.sdp ?? ""
      };

      socket.emit("call:answer", {
        conversationId: incomingCall.conversationId,
        sdp: payload
      });

      setActiveCallConversationId(incomingCall.conversationId);
      setIncomingCall(null);
      setCallState("in-call");
      setCallNotice("Call connected.");
    } catch {
      resetCallLocally();
      setCallNotice("Unable to accept call.");
    }
  }

  function rejectIncomingCall(): void {
    if (!socket || !incomingCall) {
      return;
    }

    socket.emit("call:reject", {
      conversationId: incomingCall.conversationId
    });

    resetCallLocally();
    setCallNotice("Call rejected.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-white">Connect</h2>
        <div className="space-y-3">
          <Input
            onChange={(event) => setConversationId(event.target.value)}
            placeholder="Conversation ID"
            value={conversationId}
          />
          <Button className="w-full" onClick={joinConversation}>
            Join room
          </Button>
          <Button className="w-full" disabled={!roomIsReady || callState !== "idle"} onClick={() => void startCall()}>
            Start internet call
          </Button>
          <Button
            className="w-full"
            disabled={callState === "idle" || callState === "ringing"}
            onClick={() => endCall(true)}
            variant="ghost"
          >
            Hang up
          </Button>
          <p className="text-xs text-white/50">Call status: {callState}</p>
        </div>
      </Card>

      <Card className="flex min-h-[520px] flex-col">
        {incomingCall ? (
          <div className="mb-4 rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-3 text-sm text-white">
            <div className="mb-3">Incoming call from {incomingCall.fromUserId}</div>
            <div className="flex gap-2">
              <Button onClick={() => void acceptIncomingCall()}>Accept</Button>
              <Button onClick={rejectIncomingCall} variant="ghost">
                Reject
              </Button>
            </div>
          </div>
        ) : null}

        {callNotice ? <p className="mb-4 text-sm text-white/60">{callNotice}</p> : null}

        <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
          {messages.map((message) => (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3" key={message.id}>
              <div className="mb-1 text-xs text-white/40">{new Date(message.createdAt).toLocaleString()}</div>
              <div className="text-sm text-white">{message.body}</div>
            </div>
          ))}

          {messages.length === 0 ? (
            <p className="text-sm text-white/50">No messages yet. Join a room to start chatting.</p>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Input
            disabled={!roomIsReady}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a message..."
            value={body}
          />
          <Button disabled={!roomIsReady} onClick={sendMessage}>
            Send
          </Button>
        </div>

        <audio autoPlay className="hidden" muted playsInline ref={localAudioRef} />
        <audio autoPlay className="hidden" playsInline ref={remoteAudioRef} />
      </Card>
    </div>
  );
}
