import { router } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/lib/theme";

// Mock — se reemplaza por fetch real
const MOCK_CONVERSATIONS = [
  { id: "1", name: "Sofía M.", lastMessage: "Hola, ¿sigues disponible mañana?", time: "19:42", unread: 2, isOnline: true },
  { id: "2", name: "Valentina R.", lastMessage: "Perfecto, confirmado para el viernes.", time: "18:15", unread: 0, isOnline: false },
  { id: "3", name: "Isabella C.", lastMessage: "Gracias por el mensaje 😊", time: "Ayer", unread: 0, isOnline: true },
  { id: "4", name: "Luna P.", lastMessage: "Te envío los detalles ahora.", time: "Ayer", unread: 1, isOnline: false },
  { id: "5", name: "Camila V.", lastMessage: "¿Cuál es tu tarifa para esa noche?", time: "Lun", unread: 0, isOnline: false }
];

type Conversation = typeof MOCK_CONVERSATIONS[number];

function ConversationRow({ item }: { item: Conversation }): JSX.Element {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/conversation/${item.id}` as never)}
      style={styles.row}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{item.name[0]}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowName, item.unread > 0 && styles.rowNameBold]}>{item.name}</Text>
          <Text style={styles.rowTime}>{item.time}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.rowMsg, item.unread > 0 && styles.rowMsgBold]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensajes</Text>
        <TouchableOpacity style={styles.newBtn}>
          <Text style={styles.newBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Buscar conversación...</Text>
      </View>

      {/* List */}
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin mensajes</Text>
            <Text style={styles.emptyText}>Cuando contactes con un perfil, la conversación aparecerá aquí.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.page,
    paddingTop: 16,
    paddingBottom: 12
  },
  headerTitle: { color: colors.white, fontSize: 26, fontWeight: "700" },
  newBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center"
  },
  newBtnText: { color: "#fff", fontSize: 22, fontWeight: "300", lineHeight: 28 },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: spacing.page,
    marginBottom: 12,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  searchIcon: { fontSize: 15 },
  searchPlaceholder: { color: colors.white40, fontSize: 14 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.page,
    paddingVertical: 14,
    gap: 14
  },
  separator: { height: 1, backgroundColor: "rgba(255,255,255,0.04)", marginLeft: spacing.page + 58 },

  avatarWrap: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.rgBorder,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitial: { color: colors.rg, fontSize: 20, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bg
  },

  rowContent: { flex: 1 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  rowName: { color: colors.white70, fontSize: 15, fontWeight: "500" },
  rowNameBold: { color: colors.white, fontWeight: "700" },
  rowTime: { color: colors.white40, fontSize: 12 },
  rowBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowMsg: { color: colors.white40, fontSize: 13, flex: 1, marginRight: 8 },
  rowMsgBold: { color: colors.white70, fontWeight: "500" },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { color: colors.white70, fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptyText: { color: colors.white40, fontSize: 14, textAlign: "center", lineHeight: 20 }
});
