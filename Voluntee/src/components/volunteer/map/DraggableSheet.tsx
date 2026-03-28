import { useRef, useEffect, type ReactNode } from "react";
import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from "react-native";

const SCREEN_H = Dimensions.get("window").height;
const SNAP_FRACTIONS = [0.20, 0.42, 0.85];
const SNAP_Y = SNAP_FRACTIONS.map((f) => SCREEN_H * (1 - f));
const TOP_Y = Math.min(...SNAP_Y);
const BOTTOM_Y = Math.max(...SNAP_Y);
const INITIAL_Y = SNAP_Y[1];

type Props = {
  children: ReactNode;
  header?: ReactNode;
  floatingButton?: ReactNode;
};

export function DraggableSheet({ children, header, floatingButton }: Props) {
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
        y.setOffset(lastPos.current);
        y.setValue(0);
      },

      onPanResponderMove: Animated.event([null, { dy: y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: (_, gs) => {
        y.flattenOffset();
        const pos = Math.max(TOP_Y, Math.min(BOTTOM_Y, lastPos.current));
        const target = closestSnap(pos, gs.vy);
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
      {floatingButton && (
        <View style={styles.floatingWrap} pointerEvents="box-none">
          {floatingButton}
        </View>
      )}
      <View {...panResponder.panHandlers}>
        <View style={styles.dragZone}>
          <View style={styles.handle} />
        </View>
        {header}
      </View>
      {children}
    </Animated.View>
  );
}

const VY_THRESHOLD = 0.5;

function closestSnap(pos: number, vy: number): number {
  const sorted = [...SNAP_Y].sort((a, b) => a - b);

  if (Math.abs(vy) > VY_THRESHOLD) {
    if (vy < 0) {
      // Swiping up (negative vy) -> go to next snap above (smaller Y)
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i] < pos - 10) return sorted[i];
      }
      return sorted[0];
    } else {
      // Swiping down (positive vy) -> go to next snap below (larger Y)
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i] > pos + 10) return sorted[i];
      }
      return sorted[sorted.length - 1];
    }
  }

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
  floatingWrap: {
    position: "absolute",
    top: -56,
    right: 16,
    zIndex: 20,
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
