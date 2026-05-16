import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';

const { height } = Dimensions.get('window');

// This screen is handled inline in DriverHomeScreen for MVP
// Keeping as placeholder for future expansion
export default function RideRequestScreen({ navigation, route }: any) {
  const ride = route?.params?.ride || {
    patientName: 'Priya Sharma',
    rideType: 'hospital_visit',
    emergencyLevel: 'low',
    specialNeeds: ['can_sit'],
    pickup: { latitude: 17.388, longitude: 78.4847, address: 'Sector 5, Madhapur' },
    destination: { latitude: 17.41, longitude: 78.45, address: 'Apollo Hospital, Jubilee Hills' },
  };

  const urgencyColors: Record<string, { bg: string; text: string }> = {
    low: { bg: colors.secondaryLight, text: colors.secondary },
    medium: { bg: colors.amberLight, text: colors.amber },
    high: { bg: colors.emergencyLight, text: colors.emergency },
  };
  const urgency = urgencyColors[ride.emergencyLevel] || urgencyColors.low;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Ride Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Patient Info Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientRow}>
            <LinearGradient
              colors={gradients.primary as unknown as string[]}
              style={styles.patientAvatar}
            >
              <Text style={styles.patientAvatarText}>{ride.patientName.charAt(0)}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{ride.patientName}</Text>
              <View style={styles.patientMeta}>
                <View style={styles.rideTypeBadge}>
                  <Ionicons name="medical" size={12} color={colors.primary} />
                  <Text style={styles.rideTypeText}>
                    {ride.rideType.replace('_', ' ')}
                  </Text>
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                  <View style={[styles.urgencyDot, { backgroundColor: urgency.text }]} />
                  <Text style={[styles.urgencyText, { color: urgency.text }]}>
                    {ride.emergencyLevel}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <MapView
            style={styles.miniMap}
            initialRegion={{
              latitude: (ride.pickup.latitude + ride.destination.latitude) / 2,
              longitude: (ride.pickup.longitude + ride.destination.longitude) / 2,
              latitudeDelta: 0.04,
              longitudeDelta: 0.04,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude: ride.pickup.latitude, longitude: ride.pickup.longitude }}
              title="Pickup"
              pinColor={colors.primary}
            />
            <Marker
              coordinate={{ latitude: ride.destination.latitude, longitude: ride.destination.longitude }}
              title="Destination"
              pinColor={colors.emergency}
            />
          </MapView>
        </View>

        {/* Route Details */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.routeIconCol}>
              <View style={[styles.routePin, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="location" size={16} color={colors.primary} />
              </View>
              <View style={styles.routeDottedLine}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.routeDot} />
                ))}
              </View>
              <View style={[styles.routePin, { backgroundColor: colors.emergencyLight }]}>
                <Ionicons name="location" size={16} color={colors.emergency} />
              </View>
            </View>
            <View style={styles.routeTextCol}>
              <View style={styles.routePoint}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress}>{ride.pickup.address}</Text>
              </View>
              <View style={styles.routePointBottom}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddress}>{ride.destination.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Special Needs */}
        {ride.specialNeeds && ride.specialNeeds.length > 0 && (
          <View style={styles.specialNeedsSection}>
            <Text style={styles.sectionTitle}>Special Needs</Text>
            <View style={styles.chipsRow}>
              {ride.specialNeeds.map((need: string) => (
                <View key={need} style={styles.chip}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
                  <Text style={styles.chipText}>{need.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomActions}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.declineButton}
        >
          <Ionicons name="close" size={20} color={colors.emergency} />
          <Text style={styles.declineButtonText}>Decline</Text>
        </Pressable>
        <Pressable style={{ flex: 1 }} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={gradients.success as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptButton}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  patientCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 6,
  },
  rideTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rideTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  mapPreview: {
    marginTop: spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.sm,
  },
  miniMap: {
    height: 160,
    width: '100%',
  },
  routeCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  routeRow: {
    flexDirection: 'row',
  },
  routeIconCol: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routePin: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDottedLine: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  routeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.disabled,
  },
  routeTextCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routePoint: {
    marginBottom: spacing.md,
  },
  routePointBottom: {
    marginTop: spacing.sm,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  specialNeedsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondary,
    textTransform: 'capitalize',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.sm,
  },
  declineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.emergency,
    backgroundColor: '#FFFFFF',
  },
  declineButtonText: {
    color: colors.emergency,
    fontWeight: '600',
    fontSize: 15,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 14,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
