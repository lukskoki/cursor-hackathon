import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";

type FaqItem = { question: string; answer: string };

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I apply for an event?",
    answer:
      "Browse available events on the home screen or map. Tap on an event to see details, then press the \"Apply\" button. You'll receive a notification once your application is reviewed.",
  },
  {
    question: "How do points work?",
    answer:
      "You earn points by completing volunteer events. Each event has a point value displayed on the event card. Points contribute to your rank on the leaderboard and unlock badges.",
  },
  {
    question: "How do I earn badges?",
    answer:
      "Badges are earned automatically when you reach certain milestones — like completing your first event, volunteering in multiple categories, or accumulating a set number of points.",
  },
  {
    question: "How do I leave a review?",
    answer:
      "After completing an event, you'll be prompted to rate your experience. You can also go to your completed events in your profile and tap \"Leave Review\".",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team at support@voluntee.app. We typically respond within 24 hours.",
  },
];

export default function Help() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

  const toggleFaq = (idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#222" />
        </Pressable>
        <Text style={styles.heading}>Help & Support</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.card}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <Pressable
                key={idx}
                onPress={() => toggleFaq(idx)}
                style={[
                  styles.faqRow,
                  idx < FAQ_ITEMS.length - 1 && styles.faqBorder,
                ]}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#888"
                  />
                </View>
                {isOpen && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Contact</Text>
        <View style={styles.card}>
          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#208AEF"
              style={styles.contactIcon}
            />
            <View>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@voluntee.app</Text>
            </View>
          </View>
        </View>

        <View style={styles.versionBlock}>
          <Ionicons name="information-circle-outline" size={20} color="#aaa" />
          <Text style={styles.versionTxt}>Voluntee v{appVersion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heading: { fontSize: 20, fontWeight: "700" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    overflow: "hidden",
  },
  faqRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  faqBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: "600", color: "#222", marginRight: 8 },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  contactIcon: { marginRight: 14 },
  contactLabel: { fontSize: 14, color: "#888" },
  contactValue: { fontSize: 16, fontWeight: "600", color: "#208AEF", marginTop: 2 },
  versionBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
  },
  versionTxt: { fontSize: 13, color: "#aaa" },
});
