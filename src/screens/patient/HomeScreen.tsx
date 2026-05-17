import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Linking,
  Pressable,
  Animated,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import * as Location from 'expo-location';
import { fetchNearbyHospitals } from '../../config/places';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useRideStore } from '../../store/rideStore';

const { width } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Illustration Component (auto-rickshaw for medical rides) ──
function AutoRickshawIllustration() {
  return (
    <View style={illustStyles.container}>
      {/* Road */}
      <View style={illustStyles.road} />
      {/* Auto-rickshaw body */}
      <View style={illustStyles.auto}>
        {/* Roof */}
        <View style={illustStyles.roof} />
        {/* Cabin */}
        <View style={illustStyles.cabin}>
          <View style={illustStyles.window} />
        </View>
        {/* Body / Passenger area */}
        <View style={illustStyles.body}>
          <View style={illustStyles.passengerWindow} />
        </View>
        {/* Wheels */}
        <View style={[illustStyles.wheel, { left: 8 }]} />
        <View style={[illustStyles.wheel, { right: 14 }]} />
        {/* Headlight */}
        <View style={illustStyles.headlight} />
      </View>
      {/* Hospital/clinic in background */}
      <View style={illustStyles.building}>
        <View style={illustStyles.buildingSign} />
        <View style={illustStyles.buildingWindow} />
        <View style={illustStyles.buildingDoor} />
      </View>
    </View>
  );
}

const illustStyles = StyleSheet.create({
  container: { height: 120, width: 200, position: 'relative', alignSelf: 'center' },
  road: { position: 'absolute', bottom: 10, left: 0, right: 0, height: 3, backgroundColor: '#D1D5DB', borderRadius: 2 },
  auto: { position: 'absolute', bottom: 12, left: 20, width: 90, height: 55 },
  roof: { position: 'absolute', top: 0, left: 10, right: 5, height: 12, backgroundColor: '#FFCE00', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cabin: { position: 'absolute', top: 10, left: 0, width: 30, height: 32, backgroundColor: '#FFCE00', borderTopLeftRadius: 8, borderBottomLeftRadius: 4, justifyContent: 'center', alignItems: 'center' },
  window: { width: 18, height: 16, backgroundColor: '#E0F2FE', borderRadius: 3 },
  body: { position: 'absolute', top: 10, left: 28, right: 0, height: 32, backgroundColor: '#FFF8D6', borderRadius: 4, borderWidth: 1.5, borderColor: '#FFCE00', justifyContent: 'center', alignItems: 'center' },
  passengerWindow: { width: 30, height: 16, backgroundColor: '#E0F2FE', borderRadius: 3 },
  wheel: { position: 'absolute', bottom: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: '#374151' },
  headlight: { position: 'absolute', bottom: 10, left: -4, width: 6, height: 6, borderRadius: 3, backgroundColor: '#FCD34D' },
  building: { position: 'absolute', right: 8, bottom: 14, width: 44, height: 58, backgroundColor: '#F3F4F6', borderTopLeftRadius: 4, borderTopRightRadius: 4, alignItems: 'center', paddingTop: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  buildingSign: { width: 20, height: 6, backgroundColor: '#10B981', borderRadius: 2, marginBottom: 6 },
  buildingWindow: { width: 14, height: 10, backgroundColor: '#E0F2FE', borderRadius: 2, marginBottom: 6 },
  buildingDoor: { width: 14, height: 16, backgroundColor: '#FFCE00', borderTopLeftRadius: 3, borderTopRightRadius: 3, position: 'absolute', bottom: 0 },
});

const SERVICE_CARDS = [
  { id: 'hospital_visit', label: 'Hospital Visit', icon: 'medical-outline' as const, color: colors.primary, bg: colors.borderLight },
  { id: 'dialysis', label: 'Dialysis', icon: 'water-outline' as const, color: colors.indigo, bg: colors.borderLight },
  { id: 'checkup', label: 'Checkup', icon: 'fitness-outline' as const, color: colors.amber, bg: colors.borderLight },
  { id: 'feeling_unwell', label: 'Feeling Unwell', icon: 'thermometer-outline' as const, color: colors.accent, bg: colors.borderLight },
];

export default function PatientHomeScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const currentRide = useRideStore((s) => s.currentRide);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState('Getting location...');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Location permission denied');
          setErrorMsg('Location permission needed');
          return;
        }

        // Try current position with timeout, fall back to last known
        let loc: Location.LocationObject | null = null;
        try {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
          });
        } catch {
          // getCurrentPosition timed out, try last known
          loc = await Location.getLastKnownPositionAsync();
        }

        if (!loc) {
          setLocationName('Waiting for GPS...');
          return;
        }

        setLocation(loc);

        // Pre-fetch hospitals in background so it's ready for booking
        fetchNearbyHospitals(loc.coords.latitude, loc.coords.longitude).then((results) => {
          console.log(`🏥 Pre-fetched ${results.length} hospitals in background`);
        });

        // Reverse geocode to get actual address
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address) {
          const parts = [address.name, address.district || address.subregion, address.city].filter(Boolean);
          setLocationName(parts.join(', ') || `${address.city}, ${address.region}`);
        } else {
          setLocationName('Location found');
        }
      } catch (e: any) {
        console.log('📍 Location error:', e.message);
        setLocationName('Tap to retry location');
      }
    })();
  }, []);

  useEffect(() => {
    if (currentRide && currentRide.status !== 'completed' && currentRide.status !== 'cancelled') {
      navigation.navigate('ActiveRide', { rideId: currentRide.id });
    }
  }, [currentRide]);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  console.log('🏠 PatientHomeScreen rendering, firstName:', firstName);

  return (
    <View style={styles.container}>
      {/* ── Top Section ── */}
      <LinearGradient
        colors={gradients.hero as unknown as string[]}
        style={styles.heroSection}
      >
        {/* Status bar spacer */}
        <View style={{ height: Platform.OS === 'ios' ? 50 : 36 }} />
        
        {/* Greeting row */}
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL('tel:108')}
            style={styles.emergencyBtn}
          >
            <Ionicons name="call" size={16} color={colors.emergency} />
          </Pressable>
        </View>

        {/* Location pill */}
        <View style={styles.locationPill}>
          <Ionicons name="location" size={14} color={colors.primaryDark} />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationName}
          </Text>
        </View>
      </LinearGradient>

      {/* ── Main Content ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card with illustration ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroCardLeft}>
            <Text style={styles.heroCardTitle}>Book an auto for{'\n'}your appointment</Text>
            <Pressable
              onPress={() => navigation.navigate('Booking')}
              style={({ pressed }) => [
                styles.bookNowBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A1A2E" />
            </Pressable>
          </View>
          <AutoRickshawIllustration />
        </View>

        {/* ── Service Grid ── */}
        <Text style={styles.sectionLabel}>Services</Text>
        <View style={styles.serviceGrid}>
          {SERVICE_CARDS.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => navigation.navigate('Booking')}
              style={({ pressed }) => [
                styles.serviceCard,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
              ]}
            >
              <View style={[styles.serviceIcon, { backgroundColor: card.bg }]}>  
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <Text style={styles.serviceLabel}>{card.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Quick Info ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoTitle}>Verified & safe drivers</Text>
              <Text style={styles.infoSub}>Background checked and trained</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primaryDark} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.infoTitle}>Average pickup in 8 min</Text>
              <Text style={styles.infoSub}>Track your auto in real-time</Text>
            </View>
          </View>
        </View>

        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}

        {/* Spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* ── Hero ── */
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  emergencyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.emergencyLight,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8D6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  /* ── Scroll ── */
  scrollArea: {
    flex: 1,
    marginTop: -12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* ── Hero Card ── */
  heroCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroCardLeft: {
    flex: 1,
  },
  heroCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 14,
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCE00',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  bookNowText: {
    color: '#1A1A2E',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ── Services ── */
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  serviceCard: {
    width: (width - 44) / 2,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  /* ── Info Card ── */
  infoCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 18,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 6,
  },

  errorText: {
    color: colors.emergency,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});
