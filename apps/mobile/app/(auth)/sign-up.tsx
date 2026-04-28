import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore, type AuthUser } from "@/lib/auth-store";
import { colors, radius, spacing } from "@/lib/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

interface RegisterResponse {
  data: { token: string; user: AuthUser } | null;
  error: string | null;
}

export default function SignUpScreen(): JSX.Element {
  const signIn = useAuthStore((s) => s.signIn);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(): Promise<void> {
    if (!name.trim() || !email.trim() || password.length < 10) {
      setError("Rellena todos los campos. Contraseña mínimo 10 caracteres.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password })
      });

      const payload = (await res.json()) as RegisterResponse;

      if (!res.ok || !payload.data) {
        setError(payload.error ?? "Error al crear la cuenta.");
        return;
      }

      await signIn(payload.data.token, payload.data.user);
      router.replace("/(tabs)/directory");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>RW</Text>
            </View>
            <Text style={styles.title}>Crear perfil</Text>
            <Text style={styles.subtitle}>Únete a la plataforma premium</Text>
          </View>

          <View style={styles.card}>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={colors.white40}
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={colors.white40}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="Mínimo 10 caracteres"
                placeholderTextColor={colors.white40}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Al registrarte aceptas nuestros términos. Solo mayores de 18 años.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={loading}
              onPress={() => void handleRegister()}
              style={styles.btnWrap}
            >
              <LinearGradient
                colors={[colors.rgLight, colors.rg, colors.rgDark]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={[styles.btn, loading && { opacity: 0.6 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Crear cuenta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Entrar</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.page, paddingBottom: 40 },

  backBtn: { paddingVertical: 16 },
  backText: { color: colors.white40, fontSize: 14 },

  header: { alignItems: "center", marginBottom: 32, marginTop: 8 },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.rg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: colors.rg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8
  },
  logoMarkText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  title: { color: colors.white, fontSize: 24, fontWeight: "700", textAlign: "center" },
  subtitle: { color: colors.white40, fontSize: 14, marginTop: 6, textAlign: "center" },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.rgBorder,
    padding: 24,
    gap: 16
  },
  errorBox: {
    backgroundColor: "rgba(248,113,113,0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.3)",
    padding: 12
  },
  errorText: { color: "#F87171", fontSize: 13, textAlign: "center" },

  field: { gap: 8 },
  label: { color: colors.white40, fontSize: 11, fontWeight: "600", letterSpacing: 1.5, textTransform: "uppercase" },
  input: {
    backgroundColor: colors.bgCardSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    color: colors.white,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14
  },

  notice: {
    backgroundColor: colors.rgMuted,
    borderRadius: radius.md,
    padding: 12
  },
  noticeText: { color: colors.white40, fontSize: 12, textAlign: "center", lineHeight: 18 },

  btnWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: colors.rg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8
  },
  btn: { paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28, alignItems: "center" },
  footerText: { color: colors.white40, fontSize: 14 },
  footerLink: { color: colors.rgLight, fontSize: 14, fontWeight: "600" }
});
