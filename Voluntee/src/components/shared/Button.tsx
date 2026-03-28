import { Pressable, Text, StyleSheet, type PressableProps } from "react-native";

type ButtonProps = PressableProps & { title: string };

export function Button({ title, ...rest }: ButtonProps) {
  return (
    <Pressable style={styles.btn} {...rest}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 12, borderRadius: 8, backgroundColor: "#208AEF" },
  label: { color: "#fff", textAlign: "center" },
});
