/**
 * Metro resolves `react-native-maps` to this file on web so route modules that
 * import maps can be bundled. The real map UI on web is `app/volunteer/tabs/map.web.tsx`.
 */
import React from "react";
import { View } from "react-native";

const MapView = React.forwardRef(function MapView({ style, children }, ref) {
  React.useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
    fitToCoordinates: () => {},
  }));
  return (
    <View style={style} collapsable={false}>
      {children}
    </View>
  );
});

export function Marker({ children, ...rest }) {
  return (
    <View {...rest} collapsable={false}>
      {children}
    </View>
  );
}

export function Callout({ children }) {
  return <View>{children}</View>;
}

export function Circle() {
  return null;
}

export function Polygon() {
  return null;
}

export function Polyline() {
  return null;
}

export function UrlTile() {
  return null;
}

export function LocalTile() {
  return null;
}

export function Heatmap() {
  return null;
}

export default MapView;
