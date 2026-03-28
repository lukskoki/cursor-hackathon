import * as WebBrowser from "expo-web-browser";
import { Stack } from "expo-router";
import { AuthSync } from "@/components/shared/AuthSync";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <>
      <AuthSync />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="shared" />
      <Stack.Screen name="volunteer" />
      <Stack.Screen name="organization" />
    </Stack>
    </>
  );
}
