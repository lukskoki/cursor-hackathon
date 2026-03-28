import { SafeAreaView, StyleSheet, type ViewProps } from "react-native";

export function ScreenWrapper({ children, style, ...rest }: ViewProps) {
  return (
    <SafeAreaView style={[styles.root, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
