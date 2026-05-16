import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="car" size={36} color="#FFCE00" />
      </View>
      <Text style={styles.brand}>Rapido Med-Auto</Text>
      <Text style={styles.subtitle}>Your ride to the clinic</Text>
      <View style={styles.loader}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotDelay1]} />
        <View style={[styles.dot, styles.dotDelay2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  loader: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCE00',
  },
  dotDelay1: {
    opacity: 0.5,
  },
  dotDelay2: {
    opacity: 0.25,
  },
});
