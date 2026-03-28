import { View, Text, StyleSheet } from "react-native";

type ReviewCardProps = { author: string; body: string; rating?: number };

export function ReviewCard({ author, body, rating }: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.author}>{author}</Text>
      {rating != null ? <Text style={styles.rating}>{rating}/5</Text> : null}
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, borderRadius: 10, backgroundColor: "#fafafa" },
  author: { fontWeight: "600" },
  rating: { marginTop: 4, fontSize: 12, color: "#666" },
  body: { marginTop: 8, lineHeight: 20 },
});
