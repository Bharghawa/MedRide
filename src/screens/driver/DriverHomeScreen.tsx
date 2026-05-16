import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, Animated, ScrollView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore, CertificationStatus } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';

const { height, width } = Dimensions.get('window');

// ── Certification Banner ──
function CertificationBanner({ status, onApply }: { status: CertificationStatus; onApply: () => void }) {
  if (status === 'certified') {
    return (
      <View style={certStyles.banner}>
        <LinearGradient
          colors={['#052E16', '#064E3B']}
          style={certStyles.bannerGradient}
        >
          <View style={certStyles.badgeIcon}>
            <Ionicons name="shield-checkmark" size={20} color={colors.certified} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={certStyles.bannerTitle}>Med-Captain Certified</Text>
            <Text style={certStyles.bannerSub}>You receive emergency medical rides</Text>
          </View>
          <View style={certStyles.certBadge}>
            <Text style={certStyles.certBadgeText}>ACTIVE</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (status === 'training') {
    return (
      <View style={certStyles.banner}>
        <LinearGradient
          colors={['#1A1A2E', '#2D2D44']}
          style={certStyles.bannerGradient}
        >
          <View style={[certStyles.badgeIcon, { backgroundColor: 'rgba(255,206,0,0.15)' }]}>  
            <Ionicons name="school" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={certStyles.bannerTitle}>Training In Progress</Text>
            <Text style={certStyles.bannerSub}>3 of 4 modules completed</Text>
            <View style={certStyles.progressBar}>
              <View style={[certStyles.progressFill, { width: '75%' }]} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (status === 'applied') {
    return (
      <View style={certStyles.banner}>
        <LinearGradient
          colors={['#1A1A2E', '#2D2D44']}
          style={certStyles.bannerGradient}
        >
          <View style={[certStyles.badgeIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
            <Ionicons name="time" size={20} color={colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={certStyles.bannerTitle}>Application Under Review</Text>
            <Text style={certStyles.bannerSub}>You'll be notified when approved</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Not applied yet — show CTA to become Med-Captain
  return (
    <Pressable onPress={onApply} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
      <View style={certStyles.banner}>
        <LinearGradient
          colors={['#2D2200', '#1A1500']}
          style={certStyles.bannerGradient}
        >
          <View style={[certStyles.badgeIcon, { backgroundColor: 'rgba(255,206,0,0.2)' }]}>
            <Ionicons name="medkit" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={certStyles.bannerTitle}>Become a Med-Captain</Text>
            <Text style={certStyles.bannerSub}>Earn 2.5x more with emergency rides</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </LinearGradient>
      </View>
    </Pressable>
  );
}

const certStyles = StyleSheet.create({
  banner: { borderRadius: 16, overflow: 'hidden', marginBottom: spacing.md },
  bannerGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  badgeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(34,197,94,0.15)', justifyContent: 'center', alignItems: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  certBadge: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  certBadgeText: { fontSize: 10, fontWeight: '800', color: colors.certified, letterSpacing: 0.5 },
  progressBar: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 8, width: '100%' },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.primary },
});

export default function DriverHomeScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const currentRide = useRideStore((s) => s.currentRide);
  const setCurrentRide = useRideStore((s) => s.setCurrentRide);
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [incomingRide, setIncomingRide] = useState<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const certStatus: CertificationStatus = user?.certificationStatus || 'none';
  const isMedCaptain = certStatus === 'certified';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  useEffect(() => {
    if (incomingRide) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [incomingRide]);

  // Simulate incoming ride request when online (for demo)
  useEffect(() => {
    if (isOnline && !currentRide && !incomingRide) {
      const timer = setTimeout(() => {
        setIncomingRide({
          id: `ride_${Date.now()}`,
          patientId: 'patient_demo_1',
          patientName: 'Priya Sharma',
          status: 'pending',
          rideType: isMedCaptain ? 'hospital_visit' : 'checkup',
          emergencyLevel: isMedCaptain ? 'medium' : 'low',
          specialNeeds: ['can_sit'],
          pickup: {
            latitude: (location?.coords.latitude || 17.385) + 0.003,
            longitude: (location?.coords.longitude || 78.4867) - 0.002,
            address: 'Sector 5, Madhapur',
          },
          destination: {
            latitude: 0,
            longitude: 0,
            address: 'Apollo Hospital, Jubilee Hills',
            hospitalName: 'Apollo Hospital',
          },
          createdAt: Date.now(),
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, currentRide, incomingRide]);

  const toggleOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newState = !isOnline;
    setIsOnline(newState);
    if (user) {
      setUser({ ...user, isOnline: newState });
    }
  };

  const handleAcceptRide = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentRide({
      ...incomingRide,
      status: 'accepted',
      driverId: user?.uid,
      driverName: user?.name,
      driverPhone: user?.phone,
      vehicleNumber: user?.vehicleNumber || 'TS 09 AB 1234',
      driverLocation: {
        latitude: location?.coords.latitude || 17.385,
        longitude: location?.coords.longitude || 78.4867,
      },
    });
    setIncomingRide(null);
    navigation.navigate('Navigation', { rideId: incomingRide.id });
  };

  const handleRejectRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIncomingRide(null);
  };

  const handleApplyMedCaptain = () => {
    if (user) {
      setUser({ ...user, certificationStatus: 'applied' });
    }
  };

  const defaultRegion = {
    latitude: location?.coords.latitude || 17.385,
    longitude: location?.coords.longitude || 78.4867,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const firstName = user?.name?.split(' ')[0] || 'Captain';

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation
        showsMyLocationButton
      />

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandleRow}>
          <View style={styles.dragHandle} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Row */}
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.greeting}>Hello, {firstName}</Text>
              <Text style={styles.greetingSub}>
                {isOnline ? (isMedCaptain ? 'Receiving med-auto requests' : 'Receiving ride requests') : 'Go online to start'}
              </Text>
            </View>

            <Pressable onPress={toggleOnline} style={styles.togglePressable}>
              {isOnline ? (
                <LinearGradient
                  colors={gradients.success as unknown as string[]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.togglePill}
                >
                  <View style={styles.toggleDotActive} />
                  <Text style={styles.toggleTextActive}>Online</Text>
                </LinearGradient>
              ) : (
                <View style={styles.togglePillOff}>
                  <Text style={styles.toggleTextOff}>Offline</Text>
                  <View style={styles.toggleDotOff} />
                </View>
              )}
            </Pressable>
          </View>

          {/* Med-Captain Certification Banner */}
          <CertificationBanner status={certStatus} onApply={handleApplyMedCaptain} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="wallet-outline" size={20} color={colors.secondary} />
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={20} color={colors.amber} />
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Incoming Ride Request */}
          {incomingRide && (
            <Animated.View style={[styles.requestCard, { transform: [{ scale: pulseAnim }] }]}>
              {/* Header */}
              <View style={styles.requestHeader}>
                <View style={styles.requestBadge}>
                  <Ionicons name="notifications" size={16} color={colors.background} />
                </View>
                <Text style={styles.requestTitle}>
                  {isMedCaptain ? 'Med-Auto Request!' : 'New Ride Request!'}
                </Text>
                <View style={[styles.requestUrgency, isMedCaptain && { backgroundColor: 'rgba(255,206,0,0.15)' }]}>
                  <Text style={[styles.requestUrgencyText, isMedCaptain && { color: colors.primary }]}>
                    {incomingRide.emergencyLevel}
                  </Text>
                </View>
              </View>

              {/* Patient Info */}
              <View style={styles.requestBody}>
                <View style={styles.requestPatientRow}>
                  <View style={styles.requestAvatar}>
                    <Text style={styles.requestAvatarText}>
                      {incomingRide.patientName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.requestPatientName}>{incomingRide.patientName}</Text>
                    <View style={styles.requestMetaRow}>
                      <Ionicons name="medical" size={13} color={colors.primary} />
                      <Text style={styles.requestMetaText}>
                        {incomingRide.rideType.replace('_', ' ')}
                      </Text>
                      <Text style={styles.requestDot}>•</Text>
                      <Ionicons name="navigate" size={13} color={colors.textSecondary} />
                      <Text style={styles.requestMetaText}>2.3 km</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.requestActions}>
                <Pressable onPress={handleRejectRide} style={styles.declineBtn}>
                  <Ionicons name="close" size={20} color={colors.emergency} />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </Pressable>
                <Pressable onPress={handleAcceptRide} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={gradients.success as unknown as string[]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.acceptBtn}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Waiting message */}
          {isOnline && !incomingRide && (
            <View style={styles.waitingRow}>
              <View style={styles.waitingDot} />
              <Text style={styles.waitingText}>
                {isMedCaptain ? 'Waiting for med-auto requests...' : 'Waiting for ride requests...'}
              </Text>
            </View>
          )}

          {/* Not certified info */}
          {!isMedCaptain && isOnline && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                You're receiving regular rides only. Get Med-Captain certified to receive emergency medical rides and earn 2.5x more.
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
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
    height: height * 0.45,
    width: '100%',
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  togglePressable: {
    borderRadius: 24,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  toggleDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  togglePillOff: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.border,
    gap: 8,
  },
  toggleTextOff: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  toggleDotOff: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textTertiary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestCard: {
    borderRadius: 18,
    backgroundColor: colors.cardBg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,206,0,0.2)',
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  requestUrgency: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  requestUrgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.amber,
    textTransform: 'capitalize',
  },
  requestBody: {
    marginBottom: spacing.md,
  },
  requestPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  requestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestAvatarText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 18,
  },
  requestPatientName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  requestMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  requestDot: {
    color: colors.textTertiary,
    marginHorizontal: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.emergency,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  declineBtnText: {
    color: colors.emergency,
    fontWeight: '600',
    fontSize: 14,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.online,
  },
  waitingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
