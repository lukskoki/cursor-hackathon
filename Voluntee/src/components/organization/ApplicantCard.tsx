import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export type ApplicantCardProps = {
  name: string;
  eventName: string;
  appliedAtLabel: string;
  avatarUrl: string;
  onApprove: () => void;
  onReject: () => void;
};

export function ApplicantCard({
  name,
  eventName,
  appliedAtLabel,
  avatarUrl,
  onApprove,
  onReject,
}: ApplicantCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.center}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.applyLine} numberOfLines={2}>
            Applying for: {eventName}
          </Text>
        </View>
        <Text style={styles.time}>{appliedAtLabel}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          onPress={onApprove}
          style={({ pressed }) => [styles.btnApprove, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnApproveText}>Approve</Text>
        </Pressable>
        <Pressable
          onPress={onReject}
          style={({ pressed }) => [styles.btnReject, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnRejectText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  top: { flexDirection: "row", alignItems: "flex-start" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  center: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  name: { fontSize: 16, fontWeight: "700", color: colors.navy },
  applyLine: { marginTop: 4, fontSize: 14, color: colors.captionGray, lineHeight: 20 },
  time: { fontSize: 13, color: colors.captionGray },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  btnApprove: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnApproveText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  btnReject: {
    flex: 1,
    backgroundColor: colors.cardGray,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnRejectText: { color: colors.muted, fontSize: 15, fontWeight: "600" },
  btnPressed: { opacity: 0.85 },
});
