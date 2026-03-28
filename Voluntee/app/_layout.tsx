import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="shared" />
      <Stack.Screen name="volunteer" />
      <Stack.Screen name="organization" />
    </Stack>
  );
}
