import { Fragment } from "react";
import * as WebBrowser from "expo-web-browser";
import { Stack } from "expo-router";
import { useAuthBootstrap } from "@/hooks/shared/useAuth";

WebBrowser.maybeCompleteAuthSession();

function AuthBootstrap() {
  useAuthBootstrap();
  return null;
}

export default function RootLayout() {
  return (
    <Fragment>
      <AuthBootstrap />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="shared" />
        <Stack.Screen name="volunteer" />
        <Stack.Screen name="organization" />
      </Stack>
    </Fragment>
  );
}
