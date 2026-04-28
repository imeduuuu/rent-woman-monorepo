import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/lib/auth-store";
import { colors, radius, spacing } from "@/lib/theme";

interface Tile {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  badge?: number;
  dot?: "green" | "amber";
  icon: string;
}

const TILES: Tile[] = [
  { id: "profile",       label: "Mi perfil",          icon: "👤", href: "/dashboard/profile" },
  { id: "listings",      label: "Mis anuncios",        icon: "📋", href: "/dashboard/listings" },
  { id: "availability",  label: "Disponible ahora",    icon: "🕐", href: "/dashboard/availability", dot: "green", sublabel: "Activar" },
  { id: "media",         label: "Fotos privadas",      icon: "🔒", href: "/dashboard/media", badge: 1 },
  { id: "stats",         label: "Visitas",              icon: "👁", href: "/dashboard/stats" },
  { id: "gallery",       label: "Mis fotos",            icon: "🖼", href: "/dashboard/media" },
  { id: "pricing",       label: "Planes y precios",     icon: "📈", href: "/pricing" },
  { id: "kyc",           label: "Verificación KYC",     icon: "🛡", href: "/dashboard/verification", dot: "amber" }
];

const planLabels: Record<string, string> = { FREE: "Free plan", PREMIUM: "Premium", ELITE: "Elite" };

function DashboardTile({ tile }: { tile: Tile }): JSX.Element {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(tile.href as never)}
      style={styles.tile}
    >
      {/* Badge */}
      {tile.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tile.badge}</Text>
        </View>
      ) : null}

      {/* Status dot */}
      {tile.dot ? (
        <View style={[styles.dot, tile.dot === "green" ? styles.dotGreen : styles.dotAmber]} />
      ) : null}

      <Text style={styles.tileIcon}>{tile.icon}</Text>
      <Text style={styles.tileLabel}>{tile.label}</Text>
      {tile.sublabel ? <Text style={styles.tileSub}>{tile.sublabel}</Text> : null}
    </TouchableOpacity>
  );
}

export default function DashboardScreen(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const isFree = user?.subscriptionPlan === "FREE";
  const planLabel = planLabels[user?.subscriptionPlan ?? "FREE"] ?? "Free plan";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {(user?.name ?? "?")[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name ?? "Tu perfil"}</Text>
            <Text style={styles.userLocation}>
              {user?.city && user?.country ? `${user.city}, ${user.country}` : "Sin ubicación"}
            </Text>
          </View>
        </View>

        {/* Plan banner */}
        <View style={styles.planBanner}>
          <View>
            <Text style={styles.planLabel}>PLAN ACTIVO</Text>
            <Text style={styles.planName}>{planLabel}</Text>
            {isFree && <Text style={styles.planSub}>Upgrade para más visibilidad</Text>}
          </View>
          <TouchableOpacity
            onPress={() => router.push("/pricing" as never)}
            style={styles.planBtn}
          >
            <LinearGradient
              colors={[colors.rgLight, colors.rg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planBtnGrad}
            >
              <Text style={styles.planBtnText}>{isFree ? "Upgrade" : "Gestionar"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tile grid */}
        <View style={styles.grid}>
          {TILES.map((tile) => (
            <DashboardTile key={tile.id} tile={tile} />
          ))}
        </View>

        {/* Site nav */}
        <View style={styles.navSection}>
          <Text style={styles.navTitle}>Navegación del sitio</Text>
          {[
            { label: "Directorio", href: "/(tabs)/directory" },
            { label: "Mensajes", href: "/(tabs)/chat" },
            { label: "Notificaciones", href: "/(tabs)/notifications" }
          ].map((item) => (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={styles.navItem}
            >
              <Text style={styles.navItemText}>{item.label}</Text>
              <Text style={styles.navChevron}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={async () => { await signOut(); router.replace("/(auth)/welcome"); }}
            style={[styles.navItem, { borderBottomWidth: 0 }]}
          >
            <Text style={[styles.navItemText, { color: colors.rg }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.page, paddingBottom: 100 },

  // Header
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 20, paddingBottom: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.rgBorder,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitial: { color: colors.rg, fontSize: 24, fontWeight: "700" },
  headerInfo: { flex: 1 },
  userName: { color: colors.white, fontSize: 18, fontWeight: "700" },
  userLocation: { color: colors.white40, fontSize: 13, marginTop: 3 },

  // Plan banner
  planBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.rgBorder,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16
  },
  planLabel: { color: colors.white40, fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  planName: { color: colors.white, fontSize: 16, fontWeight: "700", marginTop: 2 },
  planSub: { color: colors.white40, fontSize: 12, marginTop: 2 },
  planBtn: { borderRadius: radius.lg, overflow: "hidden" },
  planBtnGrad: { paddingHorizontal: 18, paddingVertical: 10 },
  planBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Tile grid
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  tile: {
    width: "47.5%",
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
    position: "relative"
  },
  tileIcon: { fontSize: 28 },
  tileLabel: { color: colors.white, fontSize: 14, fontWeight: "600", textAlign: "center" },
  tileSub: { color: colors.white40, fontSize: 11, textAlign: "center" },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  dot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bg
  },
  dotGreen: { backgroundColor: colors.green },
  dotAmber: { backgroundColor: colors.amber },

  // Site nav
  navSection: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden"
  },
  navTitle: {
    color: colors.white40,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)"
  },
  navItemText: { color: colors.white70, fontSize: 15 },
  navChevron: { color: colors.white40, fontSize: 20 }
});
