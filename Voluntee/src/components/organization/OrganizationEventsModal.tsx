import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import type { OrganizerEventListRow, OrganizerEventListStatus } from "@/types/organization/dashboard";

type OrganizationEventsModalProps = {
  visible: boolean;
  onClose: () => void;
  events: OrganizerEventListRow[];
};

const STATUS_LABEL: Record<OrganizerEventListStatus, string> = {
  in_progress: "IN PROGRESS",
  upcoming: "UPCOMING",
  completed: "COMPLETED",
  draft: "DRAFT",
  cancelled: "CANCELLED",
};

const STATUS_STYLE: Record<
  OrganizerEventListStatus,
  { bg: string; text: string }
> = {
  in_progress: { bg: colors.primary, text: "#fff" },
  upcoming: { bg: "#E3F2FD", text: colors.primary },
  completed: { bg: "#E8F5E9", text: "#2E7D32" },
  draft: { bg: colors.statsMuted, text: colors.muted },
  cancelled: { bg: "#FFEBEE", text: "#C62828" },
};

function EventRow({ item }: { item: OrganizerEventListRow }) {
  const badge = STATUS_STYLE[item.status];
  return (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <View style={[styles.pill, { backgroundColor: badge.bg }]}>
          <Text style={[styles.pillText, { color: badge.text }]}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowDetail}>{item.detailLabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border} />
    </View>
  );
}

export function OrganizationEventsModal({ visible, onClose, events }: OrganizationEventsModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const maxListHeight = Math.min(height * 0.62, 520);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md),
              maxHeight: height * 0.88,
            },
          ]}
        >
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>All events</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={colors.navy} />
          </Pressable>
        </View>
        <Text style={styles.sub}>{events.length} total</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventRow item={item} />}
          style={{ maxHeight: maxListHeight }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
        />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,41,0.45)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handleWrap: { alignItems: "center", marginBottom: spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy },
  closeBtn: { padding: 4 },
  sub: { fontSize: 14, color: colors.muted, marginBottom: spacing.md },
  listContent: { paddingBottom: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowMain: { flex: 1, paddingRight: spacing.sm },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  pillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  rowTitle: { fontSize: 16, fontWeight: "700", color: colors.navy },
  rowDetail: { fontSize: 14, color: colors.muted, marginTop: 4, lineHeight: 20 },
});
