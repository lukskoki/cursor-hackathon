import { TextInput, StyleSheet, type TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return <TextInput style={styles.input} placeholderTextColor="#888" {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
