import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/lib/theme";

const MOCK_NOTIFICATIONS = [
  { id: "1", type: "message", text: "Sofía M. te ha enviado un mensaje", time: "Hace 5 min", dot: true },
  { id: "2", type: "view", text: "Tu perfil recibió 12 visitas hoy", time: "Hace 1h", dot: false },
  { id: "3", type: "favorite", text: "Alguien guardó tu anuncio en favoritos", time: "Hace 3h", dot: false },
  { id: "4", type: "kyc", text: "Tu verificación KYC está en revisión", time: "Ayer", dot: false },
  { id: "5", type: "plan", text: "Tu plan Premium se renueva en 29 días", time: "Ayer", dot: false }
];

const typeIcon: Record<string, string> = {
  message: "💬",
  view: "👁",
  favorite: "❤️",
  kyc: "🛡",
  plan: "⭐"
};

export default function NotificationsScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
      </View>

      <View style={styles.list}>
        {MOCK_NOTIFICATIONS.map((n, i) => (
          <View
            key={n.id}
            style={[styles.row, i === MOCK_NOTIFICATIONS.length - 1 && { borderBottomWidth: 0 }]}
          >
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{typeIcon[n.type]}</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowText, n.dot && styles.rowTextUnread]}>{n.text}</Text>
              <Text style={styles.rowTime}>{n.time}</Text>
            </View>
            {n.dot && <View style={styles.unreadDot} />}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.page, paddingTop: 16, paddingBottom: 12 },
  title: { color: colors.white, fontSize: 26, fontWeight: "700" },

  list: {
    marginHorizontal: spacing.page,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 14
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.rgMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: { fontSize: 18 },
  rowContent: { flex: 1 },
  rowText: { color: colors.white70, fontSize: 14, lineHeight: 20 },
  rowTextUnread: { color: colors.white, fontWeight: "600" },
  rowTime: { color: colors.white40, fontSize: 12, marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.rg }
});
