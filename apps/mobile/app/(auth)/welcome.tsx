import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/lib/theme";

const { height } = Dimensions.get("window");

export default function WelcomeScreen(): JSX.Element {
  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={["rgba(196,119,122,0.22)", "rgba(13,8,9,0)", "rgba(13,8,9,0)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circle top */}
      <View style={styles.circleOuter} pointerEvents="none">
        <View style={styles.circleInner} />
      </View>

      <SafeAreaView style={styles.safe}>
        {/* Logo block */}
        <View style={styles.logoBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>RW</Text>
          </View>
          <Text style={styles.logoText}>rwoman</Text>
          <Text style={styles.tagline}>Directorio premium verificado</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.pills}>
          {["KYC Verificado", "Mensajería real", "100% privado"].map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <View style={styles.ctas}>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
              <LinearGradient
                colors={[colors.rgLight, colors.rg, colors.rgDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnGradient}
              >
                <Text style={styles.btnPrimaryText}>Crear perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.8}>
              <Text style={styles.btnSecondaryText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Legal */}
        <Text style={styles.legal}>Solo mayores de 18 años. Todos los perfiles son verificados.</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.page,
    justifyContent: "space-between",
    paddingBottom: 32
  },

  // Decorative circle
  circleOuter: {
    position: "absolute",
    top: -height * 0.12,
    alignSelf: "center",
    width: height * 0.6,
    height: height * 0.6,
    borderRadius: height * 0.3,
    backgroundColor: "rgba(196,119,122,0.07)",
    alignItems: "center",
    justifyContent: "center"
  },
  circleInner: {
    width: height * 0.38,
    height: height * 0.38,
    borderRadius: height * 0.19,
    backgroundColor: "rgba(196,119,122,0.09)"
  },

  // Logo
  logoBlock: {
    alignItems: "center",
    marginTop: height * 0.1
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: colors.rg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12
  },
  logoMarkText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 6
  },
  tagline: {
    color: colors.white40,
    fontSize: 13,
    marginTop: 8,
    letterSpacing: 1.5
  },

  // Pills
  pills: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.rgBorder,
    backgroundColor: colors.rgMuted,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  pillText: {
    color: colors.rgLight,
    fontSize: 12,
    fontWeight: "500"
  },

  // CTAs
  ctas: {
    gap: 12
  },
  btnPrimary: {
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: colors.rg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: "center"
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  btnSecondary: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.rgBorder,
    backgroundColor: colors.rgMuted
  },
  btnSecondaryText: {
    color: colors.rgLight,
    fontSize: 16,
    fontWeight: "600"
  },

  // Legal
  legal: {
    textAlign: "center",
    color: colors.white40,
    fontSize: 11,
    lineHeight: 16
  }
});
