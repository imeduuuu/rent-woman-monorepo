import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius } from "@/lib/theme";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 3) / 3; // 3 cols, 1px gap between

const FILTERS = ["Todos", "Online", "Verificados", "Barcelona", "Madrid", "Premium", "Elite"];

// Mock data — se reemplaza por fetch real cuando la API esté lista
const MOCK_PROFILES = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  slug: `perfil-${i + 1}`,
  name: ["Luna", "Sofía", "Valentina", "Isabella", "Camila", "Gabriela", "Natalia", "Andrea", "Alejandra", "Daniela", "Sara", "Paula", "Diana", "Laura", "Ana", "María", "Julia", "Carla"][i] ?? `Perfil ${i + 1}`,
  city: ["Barcelona", "Madrid", "Valencia", "Sevilla"][i % 4] ?? "Barcelona",
  isOnline: i % 3 !== 0,
  isFeatured: i % 5 === 0,
  isTravel: i % 4 === 1,
  photo: null as string | null
}));

interface Profile {
  id: string;
  slug: string;
  name: string;
  city: string;
  isOnline: boolean;
  isFeatured: boolean;
  isTravel: boolean;
  photo: string | null;
}

function ProfileCard({ item }: { item: Profile }): JSX.Element {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/profile/${item.slug}`)}
      style={styles.card}
    >
      {/* Photo background */}
      <View style={styles.photoPlaceholder}>
        <Text style={styles.photoInitial}>{item.name[0]}</Text>
      </View>

      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Online dot */}
      {item.isOnline && <View style={styles.onlineDot} />}

      {/* Featured badge */}
      {item.isFeatured && (
        <View style={styles.featuredBadge}>
          <Text style={styles.featuredText}>TOP</Text>
        </View>
      )}

      {/* Name + city */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCity} numberOfLines={1}>
          {item.isTravel ? "✈ " : ""}{item.city}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DirectoryScreen(): JSX.Element {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const renderItem = useCallback(({ item }: { item: Profile }) => (
    <ProfileCard item={item} />
  ), []);

  const keyExtractor = useCallback((item: Profile) => item.id, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>RW</Text>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchPrefix}>Perfiles en: </Text>
          <TextInput
            onChangeText={setSearch}
            placeholder="Barcelona, Spain"
            placeholderTextColor={colors.white40}
            style={styles.searchInput}
            value={search}
          />
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchBtnIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={MOCK_PROFILES}
        keyExtractor={keyExtractor}
        numColumns={3}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        columnWrapperStyle={{ gap: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rgBorder
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center"
  },
  logoText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  searchPrefix: { color: colors.white40, fontSize: 13 },
  searchInput: { flex: 1, color: colors.white, fontSize: 13, fontWeight: "600", padding: 0 },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center"
  },
  searchBtnIcon: { fontSize: 16 },

  // Filters
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  filterChipActive: {
    borderColor: colors.rg,
    backgroundColor: colors.rgMuted
  },
  filterText: { color: colors.white40, fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: colors.rgLight, fontWeight: "600" },

  // Cards
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 1.35,
    backgroundColor: colors.bgCard,
    overflow: "hidden"
  },
  photoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2A1518",
    alignItems: "center",
    justifyContent: "center"
  },
  photoInitial: {
    color: colors.rgBorder,
    fontSize: 36,
    fontWeight: "700"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // gradient simulado con una vista semitransparente en el bottom
  },
  onlineDot: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.green,
    borderWidth: 2,
    borderColor: colors.bg
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.rg,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  featuredText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  cardFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 7,
    paddingVertical: 6
  },
  cardName: { color: colors.white, fontSize: 12, fontWeight: "700" },
  cardCity: { color: colors.white40, fontSize: 11, marginTop: 1 }
});
