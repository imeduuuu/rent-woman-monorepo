import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { colors, radius, spacing } from "@/lib/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  caseId?: string;
  messageId?: string;
  feedbackSent?: boolean;
}

interface SupportResponse {
  data: {
    success: boolean;
    response?: string;
    caseId?: string;
    messageId?: string;
  };
  error: string | null;
}

export default function SupportScreen(): JSX.Element {
  const { user, token } = useAuthStore();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: `Hola${user?.name ? ` ${user.name.split(" ")[0]}` : ""}! 👋 Soy el asistente de rwoman. ¿En qué puedo ayudarte?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  async function sendMessage(): Promise<void> {
    const text = input.trim();
    if (!text || loading || !user || !token) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/support/message`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          message: text,
          channel: "chat",
          country: "ES"
        })
      });

      const payload = (await res.json()) as SupportResponse;
      const agentText =
        payload.data?.response ??
        "Tu mensaje ha sido recibido. Un agente te responderá en breve.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: agentText,
          caseId: payload.data?.caseId,
          messageId: payload.data?.messageId,
          feedbackSent: false
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "agent", text: "No se pudo enviar el mensaje. Comprueba tu conexión." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(msg: Message, rating: "positive" | "negative"): Promise<void> {
    if (!msg.caseId || !msg.messageId || msg.feedbackSent || !user || !token) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedbackSent: true } : m))
    );

    try {
      await fetch(`${API_URL}/api/v1/support/feedback`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ caseId: msg.caseId, messageId: msg.messageId, userId: user.id, rating })
      });
    } catch {
      // silencioso
    }
  }

  function renderMessage({ item }: { item: Message }): JSX.Element {
    const isUser = item.role === "user";

    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.agentAvatar}>
            <Text style={styles.agentAvatarText}>RW</Text>
          </View>
        )}

        <View style={[styles.msgWrap, isUser && styles.msgWrapMax]}>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAgent]}>
            <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
              {item.text}
            </Text>
          </View>

          {/* Feedback */}
          {!isUser && item.caseId && !item.feedbackSent && (
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                onPress={() => void sendFeedback(item, "positive")}
                style={styles.feedbackBtn}
              >
                <Text style={styles.feedbackBtnText}>👍 Útil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => void sendFeedback(item, "negative")}
                style={styles.feedbackBtn}
              >
                <Text style={styles.feedbackBtnText}>👎 No útil</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isUser && item.caseId && item.feedbackSent && (
            <Text style={styles.feedbackSent}>Gracias por tu valoración</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Soporte</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Activo ahora</Text>
          </View>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>RW</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={[styles.msgRow]}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarText}>RW</Text>
                </View>
                <View style={[styles.bubble, styles.bubbleAgent, { paddingVertical: 14, paddingHorizontal: 18 }]}>
                  <ActivityIndicator color={colors.rg} size="small" />
                </View>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={colors.white40}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={() => void sendMessage()}
          />
          <TouchableOpacity
            onPress={() => void sendMessage()}
            disabled={loading || !input.trim()}
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendBtnIcon}>↑</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Powered by IA · rwoman Support</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.page,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(196,119,122,0.15)",
    gap: 12
  },
  backBtn: { width: 36, alignItems: "flex-start" },
  backText: { color: colors.white70, fontSize: 22 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { color: colors.white, fontSize: 16, fontWeight: "700" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  onlineText: { color: colors.green, fontSize: 11, fontWeight: "500" },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center"
  },
  headerAvatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  // Messages
  list: { paddingHorizontal: spacing.page, paddingVertical: 16, gap: 16 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowUser: { flexDirection: "row-reverse" },
  msgWrap: { flex: 1 },
  msgWrapMax: { alignItems: "flex-end" },

  agentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  agentAvatarText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%"
  },
  bubbleUser: {
    backgroundColor: colors.rg,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4
  },
  bubbleAgent: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: "rgba(196,119,122,0.15)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4
  },
  bubbleText: { color: colors.white70, fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },

  // Feedback
  feedbackRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  feedbackBtn: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  feedbackBtnText: { color: colors.white40, fontSize: 12 },
  feedbackSent: { color: colors.white40, fontSize: 11, marginTop: 5 },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: spacing.page,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)"
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(196,119,122,0.2)",
    color: colors.white,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center"
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnIcon: { color: "#fff", fontSize: 20, fontWeight: "700" },

  footer: {
    textAlign: "center",
    color: colors.white40,
    fontSize: 10,
    paddingBottom: 8
  }
});
