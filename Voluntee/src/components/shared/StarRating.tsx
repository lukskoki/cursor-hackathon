import { View, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  rating: number;
  maxStars?: number;
  size?: number;
  color?: string;
  interactive?: boolean;
  onRate?: (n: number) => void;
};

export function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  color = "#FFB800",
  interactive = false,
  onRate,
}: Props) {
  const stars: React.ReactNode[] = [];

  for (let i = 1; i <= maxStars; i++) {
    const name =
      rating >= i
        ? "star"
        : rating >= i - 0.5
          ? "star-half"
          : "star-outline";

    const star = (
      <Ionicons key={i} name={name} size={size} color={color} />
    );

    if (interactive && onRate) {
      stars.push(
        <Pressable key={i} onPress={() => onRate(i)} hitSlop={4}>
          <Ionicons name={name} size={size} color={color} />
        </Pressable>,
      );
    } else {
      stars.push(star);
    }
  }

  return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});
