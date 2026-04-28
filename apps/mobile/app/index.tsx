import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

export default function Index(): JSX.Element {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.rg} size="large" />
      </View>
    );
  }

  if (token) {
    return <Redirect href="/(tabs)/directory" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
