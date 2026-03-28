import { View, type ViewProps } from "react-native";

export type AnimatedIconProps = ViewProps & {
  /** Placeholder for Expo template compatibility */
  name?: string;
};

/**
 * Stub zamjena za Expo predložak — zamijeni pravom ikonom/animacijom kad bude potrebno.
 */
export default function AnimatedIcon({ style, ...rest }: AnimatedIconProps) {
  return <View style={[{ minWidth: 24, minHeight: 24 }, style]} {...rest} />;
}
