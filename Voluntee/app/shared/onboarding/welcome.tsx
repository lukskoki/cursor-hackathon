import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenWrapper } from "@/components/shared/ScreenWrapper";
import { colors, spacing, typography } from "@/theme";
import { enterDevOrganizationDashboard } from "@/utils/dev/enterDevOrganization";

export default function Welcome() {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (router.canGoBack()) {
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, []),
  );

  return (
    <ScreenWrapper style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.titleLine}>
            <Text style={styles.titleDark}>Welcome to </Text>
            <Text style={styles.titleBrand}>Voluntee</Text>
          </Text>
          <Text style={styles.subtitle}>
            {`Empowering Zagreb's spirit through collective action and meaningful connections.`}
          </Text>
        </View>

        <View style={styles.middle}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaPrimary,
              pressed && styles.ctaPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/shared/auth/register",
                params: { role: "volunteer" },
              })
            }
          >
            <View style={styles.ctaIconWrapLight}>
              <Ionicons name="heart" size={28} color={colors.primary} />
            </View>
            <View style={styles.ctaTextCol}>
              <Text style={styles.ctaTitleLight}>Become a Volunteer</Text>
              <Text style={styles.ctaSubLight}>
                Join local initiatives and make an impact.
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ctaSecondary,
              pressed && styles.ctaPressed,
            ]}
            onPress={() =>
              router.push({
                pathname: "/shared/auth/register",
                params: { role: "organization" },
              })
            }
          >
            <View style={styles.ctaIconWrapBlue}>
              <Ionicons name="business" size={26} color={colors.primary} />
            </View>
            <View style={styles.ctaTextCol}>
              <Text style={styles.ctaTitleDark}>Find Volunteers</Text>
              <Text style={styles.ctaSubMuted}>
                Post opportunities for your organization.
              </Text>
            </View>
          </Pressable>

          <View style={styles.dividerBlock}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>ALREADY A MEMBER?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={() => router.push("/shared/auth/login")}
            style={({ pressed }) => pressed && styles.linkPressed}
          >
            <Text style={styles.signInLink}>Log in to your account</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          {/* TODO(dev): remove this block before release */}
          <Pressable
            style={({ pressed }) => [
              styles.devBtn,
              pressed && styles.ctaPressed,
            ]}
            onPress={() => router.replace("/volunteer/tabs/home")}
          >
            <Text style={styles.devBtnText}>[DEV] Skip to volunteer home</Text>
          </Pressable>
          {__DEV__ ? (
            <Pressable
              style={({ pressed }) => [
                styles.devBtnOrg,
                pressed && styles.ctaPressed,
              ]}
              onPress={() => enterDevOrganizationDashboard()}
            >
              <Text style={styles.devBtnOrgText}>[DEV] Skip to organizer dashboard</Text>
            </Pressable>
          ) : null}

          <Text style={styles.footerText}>
            ZAGREB VOLUNTEER NETWORK • 2026
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: undefined,
});

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  header: {
    paddingTop: spacing.xl + spacing.lg,
    marginBottom: spacing.sm,
  },
  middle: {
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    width: "100%",
  },
  titleLine: {
    ...typography.title,
    fontSize: 26,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  titleDark: {
    color: colors.text,
    fontWeight: "700",
  },
  titleBrand: {
    color: colors.primary,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: "center",
    fontFamily: serif,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  ctaSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaIconWrapLight: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaIconWrapBlue: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e8f4fd",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTextCol: {
    flex: 1,
  },
  ctaTitleLight: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  ctaSubLight: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  ctaTitleDark: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  ctaSubMuted: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  dividerBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
    letterSpacing: 0.5,
  },
  signInLink: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  linkPressed: {
    opacity: 0.7,
  },
  footer: {
    width: "100%",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    alignItems: "center",
  },
  devBtn: {
    borderWidth: 2,
    borderColor: "#d97706",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "#fffbeb",
  },
  devBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b45309",
  },
  devBtnOrg: {
    borderWidth: 2,
    borderColor: "#208AEF",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "#EFF6FF",
    marginTop: spacing.sm,
  },
  devBtnOrgText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  footerText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: "center",
  },
});
