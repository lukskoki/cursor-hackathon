import { useRef, useEffect } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";

const SCREEN_H = Dimensions.get("window").height;
const SNAP_FRACTIONS = [0.12, 0.42, 0.85];
const SNAP_Y = SNAP_FRACTIONS.map((f) => SCREEN_H * (1 - f));
const TOP_Y = Math.min(...SNAP_Y);
const BOTTOM_Y = Math.max(...SNAP_Y);
const INITIAL_Y = SNAP_Y[1];

console.log("[Sheet] SCREEN_H:", SCREEN_H, "SNAP_Y:", SNAP_Y, "TOP_Y:", TOP_Y, "BOTTOM_Y:", BOTTOM_Y, "INITIAL_Y:", INITIAL_Y);

type Props = { children: React.ReactNode };

export function DraggableSheet({ children }: Props) {
  const y = useRef(new Animated.Value(INITIAL_Y)).current;
  const lastPos = useRef(INITIAL_Y);

  useEffect(() => {
    const id = y.addListener(({ value }) => {
      lastPos.current = value;
    });
    return () => y.removeListener(id);
  }, [y]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 4,
      onMoveShouldSetPanResponderCapture: (_, gs) => Math.abs(gs.dy) > 4,

      onPanResponderGrant: () => {
        console.log("[Sheet] GRANT lastPos:", lastPos.current);
        y.setOffset(lastPos.current);
        y.setValue(0);
      },

      onPanResponderMove: Animated.event([null, { dy: y }], {
        useNativeDriver: false,
        listener: (_: unknown, gs: { dy: number }) => {
          console.log("[Sheet] MOVE dy:", gs.dy, "lastPos:", lastPos.current);
        },
      }),

      onPanResponderRelease: (_: unknown, gs: { dy: number; vy: number }) => {
        y.flattenOffset();
        console.log("[Sheet] RELEASE gs.dy:", gs.dy, "lastPos:", lastPos.current);
        const pos = Math.max(TOP_Y, Math.min(BOTTOM_Y, lastPos.current));
        const target = closestSnap(pos);
        console.log("[Sheet] SNAP pos:", pos, "target:", target);
        Animated.spring(y, {
          toValue: target,
          useNativeDriver: false,
          damping: 20,
          stiffness: 180,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View style={[styles.root, { top: y }]}>
      <View {...panResponder.panHandlers} style={styles.dragZone}>
        <View style={styles.handle} />
      </View>
      {children}
    </Animated.View>
  );
}

function closestSnap(pos: number): number {
  let best = SNAP_Y[0];
  let bestDist = Math.abs(pos - best);
  for (let i = 1; i < SNAP_Y.length; i++) {
    const d = Math.abs(pos - SNAP_Y[i]);
    if (d < bestDist) {
      bestDist = d;
      best = SNAP_Y[i];
    }
  }
  return best;
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
  dragZone: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
});
