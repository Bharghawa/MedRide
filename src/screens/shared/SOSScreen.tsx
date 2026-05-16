import React from 'react';
import { View, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../theme';

const emergencyNumbers = [
  { id: '1', name: 'Ambulance', number: '108', icon: 'medkit' as const, desc: 'Government Ambulance Service' },
  { id: '2', name: 'Emergency', number: '112', icon: 'shield-checkmark' as const, desc: 'Unified Emergency Number' },
  { id: '3', name: 'Police', number: '100', icon: 'shield' as const, desc: 'Police Control Room' },
  { id: '4', name: 'Women Helpline', number: '1091', icon: 'people' as const, desc: 'Women Safety Helpline' },
];

export default function SOSScreen() {
  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Calm Header */}
      <LinearGradient
        colors={['#FFF8D6', '#FFFFFF']}
        style={styles.gradientHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primaryDark} />
          <Text style={styles.emergencyTitle}>Help & Safety</Text>
          <Text style={styles.emergencySubtitle}>Quick access to emergency contacts</Text>
        </View>
      </LinearGradient>

      {/* White Overlapping Card */}
      <View style={styles.mainCard}>
        {/* Call 108 Button */}
        <View style={styles.sosButtonContainer}>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:108')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F59E0B', '#FFCE00']}
              style={styles.sosCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="call" size={36} color="#1A1A2E" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.sosLabel}>Call 108</Text>
          <Text style={styles.sosDesc}>Government Ambulance Service</Text>
        </View>

        {/* Emergency Numbers */}
        <Text style={styles.sectionTitle}>Important Numbers</Text>

        {emergencyNumbers.map((item) => (
          <View key={item.id} style={styles.numberCard}>
            <View style={styles.numberCardLeft}>
              <View style={styles.numberIconCircle}>
                <Ionicons name={item.icon} size={20} color={colors.emergency} />
              </View>
              <View style={styles.numberInfo}>
                <Text style={styles.numberName}>{item.name}</Text>
                <Text style={styles.numberValue}>{item.number}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${item.number}`)}
              style={styles.callButton}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={18} color={colors.emergency} />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.disclaimerText}>
            Rapido Med-Auto is for non-emergency medical transport only. For serious emergencies, always call 108.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientHeader: {
    paddingTop: 70,
    paddingBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: spacing.sm,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -40,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 40,
    minHeight: 500,
    ...shadows.lg,
  },
  sosButtonContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sosCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.colored('#E5B800'),
  },
  sosLabel: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  sosDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  numberCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.emergencyLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberInfo: {
    gap: 2,
  },
  numberName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  numberValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.emergency,
    backgroundColor: colors.emergencyLight,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emergency,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
