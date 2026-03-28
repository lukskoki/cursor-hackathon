import { useRef, useCallback } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  type LayoutChangeEvent,
} from "react-native";

const SCREEN_H = Dimensions.get("window").height;

type Props = {
  snapFractions?: number[];
  initialSnap?: number;
  children: React.ReactNode;
};

export function DraggableSheet({
  snapFractions = [0.12, 0.42, 0.85],
  initialSnap = 1,
  children,
}: Props) {
  const snapPoints = snapFractions.map((f) => SCREEN_H * (1 - f));
  const translateY = useRef(new Animated.Value(snapPoints[initialSnap])).current;
  const currentY = useRef(snapPoints[initialSnap]);
  const containerH = useRef(SCREEN_H);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    containerH.current = e.nativeEvent.layout.height;
  }, []);

  const snapTo = useCallback(
    (toValue: number) => {
      currentY.current = toValue;
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      }).start();
    },
    [translateY],
  );

  const findClosestSnap = useCallback(
    (y: number, vy: number) => {
      const projected = y + vy * 100;
      let closest = snapPoints[0];
      let minDist = Math.abs(projected - closest);
      for (let i = 1; i < snapPoints.length; i++) {
        const dist = Math.abs(projected - snapPoints[i]);
        if (dist < minDist) {
          minDist = dist;
          closest = snapPoints[i];
        }
      }
      return closest;
    },
    [snapPoints],
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderGrant: () => {
        translateY.setOffset(currentY.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        const next = currentY.current + g.dy;
        const minY = snapPoints[0];
        const maxY = snapPoints[snapPoints.length - 1];
        if (next >= minY && next <= maxY) {
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        translateY.flattenOffset();
        const raw = currentY.current + g.dy;
        snapTo(findClosestSnap(raw, g.vy));
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[styles.root, { transform: [{ translateY }] }]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    height: SCREEN_H,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  handleWrap: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
  },
});
