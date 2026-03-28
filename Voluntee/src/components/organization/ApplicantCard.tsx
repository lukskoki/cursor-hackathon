import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export type ApplicantCardProps = {
  name: string;
  eventName: string;
  appliedAtLabel: string;
  avatarUrl: string;
  onApprove?: () => void;
  onReject?: () => void;
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
      <View style={styles.topRow}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.textCol}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.applyLine} numberOfLines={2}>
            Applying for: {eventName}
          </Text>
        </View>
        <Text style={styles.time}>{appliedAtLabel}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.btnApprove, pressed && styles.btnPressed]}
          onPress={onApprove}
        >
          <Text style={styles.btnApproveText}>Approve</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnReject, pressed && styles.btnPressed]}
          onPress={onReject}
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
    borderRadius: 16,
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
  topRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: spacing.sm },
  textCol: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: "700", color: colors.navy },
  applyLine: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 13, color: colors.muted, marginLeft: spacing.xs },
  actions: { flexDirection: "row", gap: spacing.sm },
  btnApprove: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnApproveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnReject: {
    flex: 1,
    backgroundColor: colors.statsMuted,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  btnRejectText: { color: colors.navy, fontSize: 15, fontWeight: "600" },
  btnPressed: { opacity: 0.85 },
});
