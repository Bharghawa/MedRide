// Web stub for react-native-maps (native-only module)
import React from 'react';
import { View, Text } from 'react-native';

const MapView = ({ style, children, ...props }) => (
  <View style={[{ backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }, style]}>
    <Text style={{ color: '#666' }}>Map (web preview)</Text>
    {children}
  </View>
);

const Marker = ({ children }) => <>{children}</>;
const Polyline = () => null;
const Circle = () => null;
const PROVIDER_GOOGLE = 'google';

MapView.Marker = Marker;

export { Marker, Polyline, Circle, PROVIDER_GOOGLE };
export default MapView;
