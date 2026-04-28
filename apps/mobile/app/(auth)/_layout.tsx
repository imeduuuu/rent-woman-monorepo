import { Stack } from "expo-router";

export default function AuthLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0D0809" }, animation: "fade" }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" options={{ animation: "slide_from_bottom" }} />
      <Stack.Screen name="sign-up" options={{ animation: "slide_from_bottom" }} />
    </Stack>
  );
}
