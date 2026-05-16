import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Linking, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useRideStore, RideStatus } from '../../store/rideStore';

const { height } = Dimensions.get('window');

const statusFlow: RideStatus[] = ['accepted', 'arriving', 'picked_up', 'in_transit', 'completed'];

const statusButtonLabels: Record<string, string> = {
  accepted: 'Arrived at Pickup',
  arriving: 'Arrived at Pickup',
  picked_up: 'Start Ride',
  in_transit: 'Complete Ride',
};

const statusDisplayLabels: Record<string, { text: string; color: string; icon: string }> = {
  accepted: { text: 'Heading to pickup', color: colors.primary, icon: 'navigate' },
  arriving: { text: 'Heading to pickup', color: colors.primary, icon: 'navigate' },
  picked_up: { text: 'Patient picked up', color: colors.secondary, icon: 'person' },
  in_transit: { text: 'On the way to hospital', color: colors.amber, icon: 'medical' },
  completed: { text: 'Ride completed', color: colors.secondary, icon: 'checkmark-circle' },
};

export default function NavigationScreen({ navigation, route }: any) {
  const currentRide = useRideStore((s) => s.currentRide);
  const updateRideStatus = useRideStore((s) => s.updateRideStatus);
  const setCurrentRide = useRideStore((s) => s.setCurrentRide);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();

    // Simulate location updates
    const interval = setInterval(async () => {
      const loc = await Location.getLastKnownPositionAsync();
      if (loc) setLocation(loc);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNextStatus = () => {
    if (!currentRide) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const currentIndex = statusFlow.indexOf(currentRide.status);
    if (currentIndex === -1) return;
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      updateRideStatus(nextStatus);

      if (nextStatus === 'completed') {
        setTimeout(() => {
          setCurrentRide(null);
          navigation.goBack();
        }, 2000);
      }
    }
  };

  const handleCallPatient = () => {
    Linking.openURL('tel:+919876543210');
  };

  const mapRegion = {
    latitude: location?.coords.latitude || currentRide?.pickup.latitude || 17.385,
    longitude: location?.coords.longitude || currentRide?.pickup.longitude || 78.4867,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  const status = currentRide?.status || 'accepted';
  const isCompleted = status === 'completed';
  const statusDisplay = statusDisplayLabels[status] || statusDisplayLabels.accepted;
  const initials = (currentRide?.patientName || 'P').split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation
      >
        <Marker
          coordinate={{
            latitude: currentRide?.pickup.latitude || 17.385,
            longitude: currentRide?.pickup.longitude || 78.4867,
          }}
          title="Pickup"
          pinColor={colors.primary}
        />
      </MapView>

      {/* Back button */}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonInner}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </View>
      </Pressable>

      {/* SOS */}
      <Pressable style={styles.sosButton} onPress={() => Linking.openURL('tel:108')}>
        <LinearGradient
          colors={gradients.emergency as unknown as string[]}
          style={styles.sosInner}
        >
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Drag Handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusDisplay.color + '18' }]}>
          <View style={[styles.statusBadgeDot, { backgroundColor: statusDisplay.color }]} />
          <Ionicons name={statusDisplay.icon as any} size={16} color={statusDisplay.color} />
          <Text style={[styles.statusBadgeText, { color: statusDisplay.color }]}>
            {statusDisplay.text}
          </Text>
        </View>

        {/* Patient Card */}
        <View style={styles.patientCard}>
          <LinearGradient
            colors={gradients.primary as unknown as string[]}
            style={styles.patientAvatar}
          >
            <Text style={styles.patientInitials}>{initials}</Text>
          </LinearGradient>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>
              {currentRide?.patientName || 'Patient'}
            </Text>
            <Text style={styles.patientSub}>Medical Transport</Text>
          </View>
          <Pressable onPress={handleCallPatient} style={styles.callButton}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Address Row */}
        <View style={styles.addressRow}>
          <Ionicons name="navigate" size={16} color={colors.primary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {status === 'accepted' || status === 'arriving'
              ? currentRide?.pickup.address || 'Pickup location'
              : currentRide?.destination.hospitalName || currentRide?.destination.address || 'Hospital'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>

        {/* Completed message */}
        {isCompleted && (
          <View style={styles.completedBox}>
            <Ionicons name="checkmark-circle" size={36} color={colors.secondary} />
            <Text style={styles.completedText}>Ride completed!</Text>
            <Text style={styles.completedSub}>Patient reached safely</Text>
          </View>
        )}

        {/* Action Button */}
        {!isCompleted && statusButtonLabels[status] && (
          <Pressable onPress={handleNextStatus} style={styles.actionButtonWrap}>
            <LinearGradient
              colors={
                status === 'in_transit'
                  ? (gradients.success as unknown as string[])
                  : (gradients.primary as unknown as string[])
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Ionicons
                name={status === 'in_transit' ? 'flag' : 'arrow-forward'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>{statusButtonLabels[status]}</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    height: height * 0.65,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
  },
  backButtonInner: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  sosButton: {
    position: 'absolute',
    top: 56,
    right: 16,
  },
  sosInner: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  bottomPanel: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...shadows.lg,
  },
  dragHandleRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.disabled,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  patientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInitials: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  patientInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  patientSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  completedBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
  },
  completedSub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionButtonWrap: {
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
