import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useEditEvent } from "@/hooks/organization/events/useEditEvent";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type EventCategory,
} from "@/types/volunteer/event";

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event, loading, saving, error, success, update } = useEditEvent(id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("community");
  const [address, setAddress] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [points, setPoints] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (event && !hydrated) {
      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category);
      setAddress(event.address);
      setVolunteersNeeded(String(event.volunteersNeeded));
      setDurationMinutes(String(event.durationMinutes));
      setPoints(String(event.points));
      setTagsText(event.tags.join(", "));
      const d = new Date(event.startsAt);
      setDateStr(d.toISOString().split("T")[0]);
      setTimeStr(
        d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );
      setHydrated(true);
    }
  }, [event, hydrated]);

  useEffect(() => {
    if (success) {
      router.back();
    }
  }, [success]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required.");
      return;
    }
    const startsAt = buildIso(dateStr, timeStr);
    await update({
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      volunteersNeeded: parseInt(volunteersNeeded, 10) || 1,
      durationMinutes: parseInt(durationMinutes, 10) || 60,
      points: parseInt(points, 10) || 0,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      startsAt,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (error && !event) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Event</Text>
          <View style={styles.backBtn} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormField label="Title">
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor="#bbb"
            />
          </FormField>

          <FormField label="Description">
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the event..."
              placeholderTextColor="#bbb"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Category">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {ALL_CATEGORIES.map((cat) => {
                const active = cat === category;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.catChip, active && styles.catChipActive]}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        active && styles.catChipTextActive,
                      ]}
                    >
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </FormField>

          <FormField label="Address">
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Event location"
              placeholderTextColor="#bbb"
            />
          </FormField>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <FormField label="Date (YYYY-MM-DD)">
                <TextInput
                  style={styles.input}
                  value={dateStr}
                  onChangeText={setDateStr}
                  placeholder="2025-06-15"
                  placeholderTextColor="#bbb"
                  keyboardType="numbers-and-punctuation"
                />
              </FormField>
            </View>
            <View style={styles.halfField}>
              <FormField label="Time (HH:MM)">
                <TextInput
                  style={styles.input}
                  value={timeStr}
                  onChangeText={setTimeStr}
                  placeholder="09:00"
                  placeholderTextColor="#bbb"
                  keyboardType="numbers-and-punctuation"
                />
              </FormField>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.thirdField}>
              <FormField label="Volunteers">
                <TextInput
                  style={styles.input}
                  value={volunteersNeeded}
                  onChangeText={setVolunteersNeeded}
                  placeholder="10"
                  placeholderTextColor="#bbb"
                  keyboardType="number-pad"
                />
              </FormField>
            </View>
            <View style={styles.thirdField}>
              <FormField label="Duration (min)">
                <TextInput
                  style={styles.input}
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="120"
                  placeholderTextColor="#bbb"
                  keyboardType="number-pad"
                />
              </FormField>
            </View>
            <View style={styles.thirdField}>
              <FormField label="Points">
                <TextInput
                  style={styles.input}
                  value={points}
                  onChangeText={setPoints}
                  placeholder="50"
                  placeholderTextColor="#bbb"
                  keyboardType="number-pad"
                />
              </FormField>
            </View>
          </View>

          <FormField label="Tags (comma-separated)">
            <TextInput
              style={styles.input}
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="cleanup, outdoor, beginner"
              placeholderTextColor="#bbb"
            />
          </FormField>

          {error && <Text style={styles.inlineError}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomBar}>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function buildIso(dateStr: string, timeStr: string): string {
  const parts = dateStr.split("-");
  const timeParts = timeStr.split(":");
  if (parts.length === 3 && timeParts.length >= 2) {
    const d = new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10),
    );
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 15, color: "#FF3B30", marginBottom: 12 },
  backLink: { fontSize: 15, color: "#208AEF", fontWeight: "600" },

  headerSafe: { backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },

  field: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#ECEEF2",
  },
  textArea: { minHeight: 100, paddingTop: 14 },

  categoryRow: { gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F2F3F5",
  },
  catChipActive: { backgroundColor: "#208AEF" },
  catChipText: { fontSize: 14, fontWeight: "600", color: "#555" },
  catChipTextActive: { color: "#fff" },

  row: { flexDirection: "row", gap: 12 },
  halfField: { flex: 1 },
  thirdField: { flex: 1 },

  inlineError: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 8,
  },

  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#208AEF",
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
