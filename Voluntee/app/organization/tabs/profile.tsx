import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authService } from "@/services/shared/authService";
import { useAuthStore } from "@/store/authStore";
import { useOrganizationProfile } from "@/hooks/organization/profile/useOrganizationProfile";
import type { OrgProfileUpdate } from "@/services/organization/profile/organizationProfileService";

const ACCENT = "#4F46E5";
const BG = "#F8F9FB";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#0F1729";
const TEXT_SECONDARY = "#6B7280";
const BORDER = "#E5E7EB";
const DANGER = "#EF4444";

type EditableField = keyof OrgProfileUpdate;

const FIELD_CONFIG: {
  key: EditableField;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  keyboard?: "url" | "phone-pad" | "default";
  multiline?: boolean;
}[] = [
  { key: "organizationName", label: "Organization Name", icon: "business-outline", placeholder: "Enter organization name" },
  { key: "description", label: "About", icon: "document-text-outline", placeholder: "Describe your organization...", multiline: true },
  { key: "website", label: "Website", icon: "globe-outline", placeholder: "https://example.com", keyboard: "url" },
  { key: "phone", label: "Phone", icon: "call-outline", placeholder: "+385 1 234 5678", keyboard: "phone-pad" },
  { key: "city", label: "City", icon: "location-outline", placeholder: "e.g. Zagreb" },
  { key: "address", label: "Address", icon: "map-outline", placeholder: "Street address" },
];

export default function OrganizationProfile() {
  const user = useAuthStore((s) => s.user);
  const { profile, loading, saving, updateProfile } = useOrganizationProfile();

  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  const email = user?.email?.trim() ?? "";
  const orgName = profile?.organizationName ?? (user?.role === "organization" ? (user as any).organizationName : "") ?? "";
  const initial = orgName ? orgName[0].toUpperCase() : email ? email[0].toUpperCase() : "O";

  const handleLogout = async () => {
    await authService.signOutUser();
    useAuthStore.getState().setDevOrganizationBypass(false);
    useAuthStore.getState().setUser(null);
    router.replace("/");
  };

  const startEdit = (field: EditableField) => {
    const current = profile?.[field] ?? "";
    setEditValue(typeof current === "string" ? current : "");
    setEditingField(field);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingField) return;
    try {
      await updateProfile({ [editingField]: editValue.trim() });
      setEditingField(null);
      setEditValue("");
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              {profile?.logoUrl ? (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
              <View style={styles.badgeContainer}>
                <Ionicons name="shield-checkmark" size={16} color={ACCENT} />
              </View>
            </View>
            <Text style={styles.headerName}>{orgName || "Your Organization"}</Text>
            <Text style={styles.headerEmail}>{email}</Text>
          </View>

          {/* Saving indicator */}
          {saving && (
            <View style={styles.savingBanner}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}

          {/* Profile Fields */}
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.card}>
            {FIELD_CONFIG.map((field, idx) => {
              const value = profile?.[field.key];
              const displayValue = typeof value === "string" ? value : "";
              const isEditing = editingField === field.key;
              const isLast = idx === FIELD_CONFIG.length - 1;

              return (
                <View key={field.key}>
                  <View style={styles.fieldRow}>
                    <View style={styles.fieldIcon}>
                      <Ionicons name={field.icon} size={20} color={ACCENT} />
                    </View>
                    <View style={styles.fieldContent}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      {isEditing ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            ref={inputRef}
                            style={[styles.editInput, field.multiline && styles.editInputMultiline]}
                            value={editValue}
                            onChangeText={setEditValue}
                            placeholder={field.placeholder}
                            placeholderTextColor="#9CA3AF"
                            keyboardType={field.keyboard ?? "default"}
                            multiline={field.multiline}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <View style={styles.editActions}>
                            <Pressable style={styles.editBtn} onPress={cancelEdit}>
                              <Ionicons name="close" size={18} color={TEXT_SECONDARY} />
                            </Pressable>
                            <Pressable style={[styles.editBtn, styles.editBtnSave]} onPress={() => void saveEdit()}>
                              <Ionicons name="checkmark" size={18} color="#fff" />
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <Pressable onPress={() => startEdit(field.key)} style={styles.fieldValueRow}>
                          <Text
                            style={[styles.fieldValue, !displayValue && styles.fieldPlaceholder]}
                            numberOfLines={field.multiline ? 3 : 1}
                          >
                            {displayValue || field.placeholder}
                          </Text>
                          <Ionicons name="pencil-outline" size={16} color="#D1D5DB" />
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>

          {/* Sign Out */}
          <Pressable
            style={styles.logoutBtn}
            onPress={() => void handleLogout()}
          >
            <Ionicons name="log-out-outline" size={20} color={DANGER} />
            <Text style={styles.logoutTxt}>Sign Out</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // Header
  header: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  badgeContainer: {
    position: "absolute",
    bottom: 0,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  headerEmail: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },

  // Saving
  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  savingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 24,
  },

  // Fields
  fieldRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldValue: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  fieldPlaceholder: {
    color: "#D1D5DB",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginLeft: 64,
  },

  // Edit
  editContainer: {
    marginTop: 4,
  },
  editInput: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FAFBFF",
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnSave: {
    backgroundColor: ACCENT,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DANGER,
    gap: 8,
  },
  logoutTxt: {
    color: DANGER,
    fontSize: 15,
    fontWeight: "600",
  },
});
