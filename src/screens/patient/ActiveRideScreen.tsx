import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Linking, Share, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useRideStore } from '../../store/rideStore';

const { height } = Dimensions.get('window');

const rideStages = ['Searching', 'Assigned', 'Pickup', 'On Way', 'Arrived'];
const statusToStage: Record<string, number> = {
  pending: 0,
  accepted: 1,
  arriving: 1,
  picked_up: 2,
  in_transit: 3,
  completed: 4,
};

const statusMessages: Record<string, { title: string; subtitle: string; color: string }> = {
  pending: {
    title: 'Finding a driver...',
    subtitle: 'Looking for trained medical drivers nearby',
    color: colors.primary,
  },
  accepted: {
    title: 'Driver accepted!',
    subtitle: 'Your driver is preparing to come',
    color: colors.secondary,
  },
  arriving: {
    title: 'Driver is on the way',
    subtitle: 'They will reach you shortly',
    color: colors.primary,
  },
  picked_up: {
    title: 'You have been picked up',
    subtitle: 'Heading to your destination',
    color: colors.secondary,
  },
  in_transit: {
    title: 'On the way to hospital',
    subtitle: 'You will reach safely',
    color: colors.secondary,
  },
  completed: {
    title: 'You reached safely ✓',
    subtitle: 'We hope you feel better soon',
    color: colors.secondary,
  },
};

export default function ActiveRideScreen({ navigation, route }: any) {
  const currentRide = useRideStore((s) => s.currentRide);
  const setCurrentRide = useRideStore((s) => s.setCurrentRide);
  const mapRef = useRef<MapView>(null);

  // Simulate driver acceptance after 3 seconds (for demo)
  useEffect(() => {
    if (currentRide?.status === 'pending') {
      const timer = setTimeout(() => {
        const ride = useRideStore.getState().currentRide;
        if (!ride) return;
        useRideStore.setState({
          currentRide: {
            ...ride,
            status: 'accepted',
            driverId: 'demo_driver',
            driverName: 'Raju Kumar',
            driverPhone: '+91 98765 43210',
            vehicleNumber: 'TS 09 AB 1234',
            driverLocation: {
              latitude: (ride.pickup.latitude || 17.385) + 0.005,
              longitude: (ride.pickup.longitude || 78.4867) + 0.003,
            },
          },
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentRide?.status]);

  // Simulate driver movement (for demo)
  useEffect(() => {
    if (currentRide?.status === 'accepted' || currentRide?.status === 'arriving') {
      const interval = setInterval(() => {
        useRideStore.setState((state) => {
          if (!state.currentRide?.driverLocation) return state;
          const pickup = state.currentRide.pickup;
          const dLoc = state.currentRide.driverLocation;
          const newLat = dLoc.latitude + (pickup.latitude - dLoc.latitude) * 0.1;
          const newLng = dLoc.longitude + (pickup.longitude - dLoc.longitude) * 0.1;
          return {
            currentRide: {
              ...state.currentRide,
              status: 'arriving',
              driverLocation: { latitude: newLat, longitude: newLng },
            },
          };
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentRide?.status]);

  const handleShareRide = async () => {
    try {
      await Share.share({
        message: `I'm on a MedRide medical transport. Track my ride: https://medride.app/track/${currentRide?.id}`,
      });
    } catch (e) {}
  };

  const handleCallDriver = () => {
    if (currentRide?.driverPhone) {
      Linking.openURL(`tel:${currentRide.driverPhone}`);
    }
  };

  const handleCancel = () => {
    setCurrentRide(null);
    navigation.goBack();
  };

  const status = currentRide?.status || 'pending';
  const statusInfo = statusMessages[status] || statusMessages.pending;
  const currentStage = statusToStage[status] ?? 0;
  const driverInitials = currentRide?.driverName
    ? currentRide.driverName.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2)
    : 'D';

  const mapRegion = {
    latitude: currentRide?.pickup.latitude || 17.385,
    longitude: currentRide?.pickup.longitude || 78.4867,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
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
        {currentRide?.driverLocation && (
          <Marker
            coordinate={{
              latitude: currentRide.driverLocation.latitude,
              longitude: currentRide.driverLocation.longitude,
            }}
            title="Driver"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* SOS Button */}
      <Pressable style={styles.sosButton} onPress={() => Linking.openURL('tel:108')}>
        <LinearGradient
          colors={gradients.emergency as unknown as string[]}
          style={styles.sosInner}
        >
          <Ionicons name="call" size={18} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        {/* Status Timeline */}
        <View style={styles.timeline}>
          {rideStages.map((stage, i) => (
            <View key={stage} style={styles.timelineStep}>
              <View style={styles.timelineDotRow}>
                <View
                  style={[
                    styles.timelineDot,
                    currentStage >= i && styles.timelineDotActive,
                    currentStage === i && styles.timelineDotCurrent,
                  ]}
                >
                  {currentStage > i && (
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  )}
                </View>
                {i < rideStages.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      currentStage > i && styles.timelineLineActive,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.timelineLabel,
                  currentStage >= i && styles.timelineLabelActive,
                ]}
                numberOfLines={1}
              >
                {stage}
              </Text>
            </View>
          ))}
        </View>

        {/* Active Status */}
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '18' }]}>
          <View style={[styles.statusBadgeDot, { backgroundColor: statusInfo.color }]} />
          <View>
            <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
            <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>
          </View>
        </View>

        {/* Driver Info Card */}
        {currentRide?.driverName && status !== 'pending' && (
          <View style={styles.driverCard}>
            <LinearGradient
              colors={gradients.primary as unknown as string[]}
              style={styles.driverAvatar}
            >
              <Text style={styles.driverInitials}>{driverInitials}</Text>
            </LinearGradient>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{currentRide.driverName}</Text>
              <Text style={styles.driverBadge}>Trained Medical Driver</Text>
              <View style={styles.driverMetaRow}>
                <Text style={styles.vehicleNumber}>{currentRide.vehicleNumber}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= 4 ? 'star' : 'star-half'}
                      size={12}
                      color={colors.amber}
                    />
                  ))}
                  <Text style={styles.ratingText}>4.5</Text>
                </View>
              </View>
            </View>
            <Pressable onPress={handleCallDriver} style={styles.callButton}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Pressable onPress={handleShareRide} style={styles.shareButton}>
            <Ionicons name="share-social" size={18} color={colors.primary} />
            <Text style={styles.shareText}>Share</Text>
          </Pressable>

          {status === 'pending' && (
            <Pressable onPress={handleCancel} style={styles.cancelButton}>
              <Ionicons name="close-circle" size={18} color={colors.emergency} />
              <Text style={styles.cancelText}>Cancel Ride</Text>
            </Pressable>
          )}

          {status !== 'pending' && (
            <Pressable
              onPress={() => Linking.openURL('tel:108')}
              style={styles.sosBottomBtn}
            >
              <Ionicons name="warning" size={18} color={colors.emergency} />
              <Text style={styles.sosBottomText}>SOS</Text>
            </Pressable>
          )}
        </View>

        {/* Destination */}
        <View style={styles.destinationRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <Text style={styles.destinationText} numberOfLines={1}>
            {currentRide?.destination.hospitalName || currentRide?.destination.address || 'Hospital'}
          </Text>
        </View>
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
    height: height * 0.55,
    width: '100%',
  },
  sosButton: {
    position: 'absolute',
    top: 56,
    right: 16,
  },
  sosInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  driverMarker: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
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
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.disabled,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: colors.secondary,
  },
  timelineDotCurrent: {
    borderWidth: 3,
    borderColor: colors.secondaryLight,
  },
  timelineLine: {
    position: 'absolute',
    right: 0,
    left: '50%',
    height: 3,
    backgroundColor: colors.disabled,
    zIndex: 0,
  },
  timelineLineActive: {
    backgroundColor: colors.secondary,
  },
  timelineLabel: {
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  timelineLabelActive: {
    color: colors.secondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.md,
  },
  statusBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  driverBadge: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  driverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  vehicleNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  callButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  shareText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.emergencyLight,
    backgroundColor: colors.emergencyLight,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.emergency,
  },
  sosBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.emergencyLight,
    backgroundColor: colors.emergencyLight,
  },
  sosBottomText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.emergency,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  destinationText: {
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
});
