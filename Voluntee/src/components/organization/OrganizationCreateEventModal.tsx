import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useCreateEvent } from "@/hooks/organization/events/useCreateEvent";

type OrganizationCreateEventModalProps = {
  visible: boolean;
  onClose: () => void;
  organizationName: string;
  onCreated?: () => void;
};

type CategoryId = "environment" | "social" | "animals" | "community" | "education";

const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "environment", label: "Environment", icon: "leaf" },
  { id: "social", label: "Social", icon: "people" },
  { id: "animals", label: "Animals", icon: "paw" },
  { id: "community", label: "Community", icon: "heart" },
  { id: "education", label: "Education", icon: "school" },
];

function parseDateTimeToISO(dateStr: string, timeStr: string): string {
  const cleaned = dateStr.replace(",", "");
  const combined = `${cleaned} ${timeStr}`;
  const parsed = new Date(combined);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

export function OrganizationCreateEventModal({
  visible,
  onClose,
  organizationName,
  onCreated,
}: OrganizationCreateEventModalProps) {
  const insets = useSafeAreaInsets();
  const { create, loading, error } = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryId>("environment");
  const [locationQuery, setLocationQuery] = useState("");
  const [dateStr, setDateStr] = useState("Mar 28, 2026");
  const [timeStr, setTimeStr] = useState("09:00 AM");
  const [limitStr, setLimitStr] = useState("12");
  const [pointsXp, setPointsXp] = useState("450");
  const [durationStr, setDurationStr] = useState("180");

  useEffect(() => {
    if (!visible) return;
    setTitle("");
    setDescription("");
    setCategory("environment");
    setLocationQuery("");
    setDateStr("Mar 28, 2026");
    setTimeStr("09:00 AM");
    setLimitStr("12");
    setPointsXp("450");
    setDurationStr("180");
  }, [visible]);

  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit() {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Please enter an event title.");
      return;
    }
    if (!locationQuery.trim()) {
      setValidationError("Please enter a location.");
      return;
    }

    const volunteersNeeded = parseInt(limitStr, 10) || 12;
    const points = parseInt(pointsXp, 10) || 15;
    const startsAt = parseDateTimeToISO(dateStr, timeStr);
    const durationMinutes = parseInt(durationStr, 10) || 180;

    try {
      const id = await create({
        title: title.trim(),
        description: description.trim() || title.trim(),
        category,
        tags: [category],
        address: locationQuery.trim(),
        latitude: 45.815,
        longitude: 15.9819,
        startsAt,
        durationMinutes,
        volunteersNeeded,
        volunteersApplied: 0,
        points,
      });

      if (id) {
        onCreated?.();
        onClose();
      }
    } catch {
      setValidationError("Failed to create event. Please try again.");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.root, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.backRow} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color={colors.navy} />
            <Text style={styles.topTitle}>Create Event</Text>
          </Pressable>
          <View style={styles.topRight}>
            <Pressable hitSlop={8} style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.navy} />
            </Pressable>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color={colors.muted} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>NEW ACTION</Text>
          </View>
          <Text style={styles.heroTitle}>Launch an Opportunity.</Text>
          <Text style={styles.heroSub}>
            Define your impact. Fill in the details to mobilize {organizationName} in Zagreb.
          </Text>

          <Text style={styles.label}>EVENT TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Maksimir Park Reforestation"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            placeholder="Describe the volunteer opportunity..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const selected = category === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategory(c.id)}
                  style={[styles.categoryCell, selected && styles.categoryCellSelected]}
                >
                  <Ionicons
                    name={c.icon}
                    size={22}
                    color={selected ? "#fff" : colors.primary}
                  />
                  <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>LOCATION</Text>
          <View style={styles.locationField}>
            <Ionicons name="location" size={20} color={colors.primary} style={styles.locationIcon} />
            <TextInput
              style={styles.locationInput}
              placeholder="Search address in Zagreb..."
              placeholderTextColor={colors.muted}
              value={locationQuery}
              onChangeText={setLocationQuery}
            />
          </View>

          <View style={styles.row2}>
            <View style={styles.row2Col}>
              <Text style={styles.label}>DATE</Text>
              <View style={styles.inlineField}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <TextInput
                  style={styles.inlineInput}
                  value={dateStr}
                  onChangeText={setDateStr}
                />
              </View>
            </View>
            <View style={styles.row2Col}>
              <Text style={styles.label}>TIME</Text>
              <View style={styles.inlineField}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <TextInput
                  style={styles.inlineInput}
                  value={timeStr}
                  onChangeText={setTimeStr}
                />
              </View>
            </View>
          </View>

          <View style={styles.row2}>
            <View style={styles.row2Col}>
              <Text style={styles.label}>DURATION (MIN)</Text>
              <View style={styles.inlineField}>
                <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
                <TextInput
                  style={styles.inlineInput}
                  value={durationStr}
                  onChangeText={(t) => setDurationStr(t.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  placeholder="180"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>
            <View style={styles.row2Col}>
              <Text style={styles.label}>LIMIT</Text>
              <View style={styles.inlineField}>
                <Ionicons name="person-outline" size={18} color={colors.primary} />
                <TextInput
                  style={styles.inlineInput}
                  value={limitStr}
                  onChangeText={setLimitStr}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.row2}>
            <View style={styles.row2Col}>
              <Text style={styles.label}>POINTS REWARD</Text>
              <View style={styles.pointsField}>
                <Ionicons name="star" size={18} color={colors.primary} />
                <Text style={styles.pointsPlus}>+</Text>
                <TextInput
                  style={styles.pointsInput}
                  value={pointsXp}
                  onChangeText={(t) => setPointsXp(t.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                />
                <Text style={styles.pointsXpSuffix}>XP</Text>
              </View>
            </View>
          </View>

          {(validationError || error) ? (
            <Text style={styles.errorText}>{validationError || error}</Text>
          ) : null}

          <Pressable
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Post opportunity"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Post Opportunity</Text>
                <Ionicons name="rocket-outline" size={20} color="#fff" />
              </>
            )}
          </Pressable>
          <Text style={styles.legal}>BY POSTING, YOU AGREE TO COMMUNITY GUIDELINES</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  topTitle: { fontSize: 18, fontWeight: "800", color: colors.navy },
  topRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBtn: { padding: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.statsMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  heroBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: colors.navy, marginBottom: spacing.sm },
  heroSub: { fontSize: 15, color: colors.muted, lineHeight: 22, marginBottom: spacing.lg },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.navy,
    backgroundColor: colors.background,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
    marginTop: spacing.xs,
  },
  categoryCell: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.statsMuted,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryCellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: { fontSize: 15, fontWeight: "700", color: colors.primary },
  categoryLabelSelected: { color: "#fff" },
  locationField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  locationIcon: { marginRight: spacing.sm },
  locationInput: { flex: 1, paddingVertical: 14, fontSize: 16, color: colors.navy },
  row2: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs },
  row2Col: { flex: 1 },
  inlineField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  inlineInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.navy },
  pointsField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.statsHero,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  pointsPlus: { fontSize: 15, fontWeight: "800", color: colors.primary },
  pointsInput: {
    minWidth: 48,
    maxWidth: 80,
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
    paddingVertical: 0,
  },
  pointsXpSuffix: { fontSize: 15, fontWeight: "800", color: colors.primary, marginLeft: 4 },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  legal: {
    marginTop: spacing.md,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.4,
  },
});
