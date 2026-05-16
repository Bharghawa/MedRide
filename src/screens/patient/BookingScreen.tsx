import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, shadows } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useRideStore, RideType, EmergencyLevel, SpecialNeed } from '../../store/rideStore';
import { db, IS_DEMO_MODE } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { fetchNearbyHospitals, NearbyHospital, getCachedHospitals } from '../../config/places';

const rideTypes: { id: RideType; label: string; icon: string }[] = [
  { id: 'hospital_visit', label: 'Hospital Visit', icon: 'medical' },
  { id: 'dialysis', label: 'Dialysis', icon: 'water' },
  { id: 'checkup', label: 'Checkup', icon: 'clipboard' },
  { id: 'feeling_unwell', label: 'Feeling Unwell', icon: 'thermometer' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const emergencyLevels: { id: EmergencyLevel; label: string; description: string; color: string }[] = [
  { id: 'low', label: 'Low', description: 'Routine visit', color: colors.secondary },
  { id: 'medium', label: 'Medium', description: 'Need care soon', color: '#F59E0B' },
  { id: 'high', label: 'High / Emergency', description: 'Serious symptoms — Call 108', color: colors.emergency },
];

const specialNeeds: { id: SpecialNeed; label: string; icon: string }[] = [
  { id: 'can_sit', label: 'Can sit normally', icon: 'person' },
  { id: 'need_helper', label: 'Need a helper', icon: 'people' },
  { id: 'wheelchair_support', label: 'Wheelchair support', icon: 'accessibility' },
];

const URGENCY_ACCENTS: Record<EmergencyLevel, { border: string; bg: string }> = {
  low: { border: colors.secondary, bg: colors.secondaryLight },
  medium: { border: '#F59E0B', bg: colors.amberLight },
  high: { border: colors.emergency, bg: colors.emergencyLight },
};

export default function BookingScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const setCurrentRide = useRideStore((s) => s.setCurrentRide);

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<RideType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<EmergencyLevel | null>(null);
  const [selectedNeeds, setSelectedNeeds] = useState<SpecialNeed[]>([]);
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<NearbyHospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch nearby hospitals when entering step 3
  useEffect(() => {
    if (step === 3 && hospitals.length === 0) {
      // Check cache first (pre-fetched from HomeScreen)
      const cached = getCachedHospitals();
      if (cached && cached.length > 0) {
        console.log(`🏥 Using ${cached.length} pre-fetched hospitals from cache`);
        setHospitals(cached);
      } else {
        loadNearbyHospitals();
      }
    }
  }, [step]);

  const loadNearbyHospitals = async () => {
    setHospitalsLoading(true);
    try {
      let lat = 17.385;
      let lng = 78.4867;
      try {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        console.log(`📍 Got real location: ${lat}, ${lng}`);
      } catch (e: any) {
        console.log(`📍 Location failed, using default: ${e.message}`);
      }
      setUserLocation({ lat, lng });
      const results = await fetchNearbyHospitals(lat, lng);
      console.log(`🏥 Got ${results.length} hospitals, first: ${results[0]?.name}`);
      setHospitals(results);
    } catch (e: any) {
      console.log(`🏥 loadNearbyHospitals error: ${e.message}`);
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmergencySelect = (level: EmergencyLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (level === 'high') {
      Alert.alert(
        '⚠️ This looks like an emergency',
        'For serious conditions like heart attack, stroke, heavy bleeding, or breathing problems, please call 108 (ambulance) immediately.\n\nRapido Med-Auto is for non-emergency transport only.',
        [
          { text: 'Call 108 Now', onPress: () => Linking.openURL('tel:108'), style: 'destructive' },
          { text: 'Go Back', style: 'cancel' },
        ]
      );
      return;
    }
    setSelectedLevel(level);
  };

  const toggleNeed = (need: SpecialNeed) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleBookRide = async () => {
    if (!selectedType || !selectedLevel || !selectedHospital) {
      Alert.alert('Missing info', 'Please complete all steps before booking.');
      return;
    }

    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const lat = userLocation?.lat ?? 17.385;
      const lng = userLocation?.lng ?? 78.4867;

      const rideData = {
        patientId: user?.uid || '',
        patientName: user?.name || '',
        status: 'pending' as const,
        rideType: selectedType,
        emergencyLevel: selectedLevel,
        specialNeeds: selectedNeeds,
        pickup: {
          latitude: lat,
          longitude: lng,
          address: 'Current Location',
        },
        destination: {
          latitude: selectedHospital.latitude,
          longitude: selectedHospital.longitude,
          address: selectedHospital.address,
          hospitalName: selectedHospital.name,
        },
        createdAt: Date.now(),
      };

      let rideId = `local_${Date.now()}`;

      if (!IS_DEMO_MODE && db) {
        try {
          const docRef = await addDoc(collection(db, 'rides'), rideData);
          rideId = docRef.id;
        } catch {
          // Firestore failed, use local ID
        }
      }

      setCurrentRide({ id: rideId, ...rideData } as any);
      navigation.navigate('ActiveRide', { rideId });
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = step === 1 ? (selectedType && selectedLevel) : true;
  const canBook = !!selectedHospital;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>Book a Ride</Text>

        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{step} of 3</Text>
        </View>
      </View>

      {/* ── Step Progress Bar ── */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <View
              style={[
                styles.progressDot,
                s <= step ? styles.progressDotActive : styles.progressDotInactive,
              ]}
            />
            {i < 2 && (
              <View
                style={[
                  styles.progressLine,
                  s < step ? styles.progressLineActive : styles.progressLineInactive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════ Step 1 ════════════ */}
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>What do you need?</Text>

            <View style={styles.typeGrid}>
              {rideTypes.map((type) => {
                const active = selectedType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedType(type.id);
                    }}
                    style={({ pressed }) => [
                      styles.typeCard,
                      active && styles.typeCardActive,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                    ]}
                  >
                    <View
                      style={[
                        styles.typeIconWrap,
                        { backgroundColor: active ? colors.primaryLight : colors.borderLight },
                      ]}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={26}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeLabel,
                        active && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
              How urgent?
            </Text>

            {emergencyLevels.map((level) => {
              const active = selectedLevel === level.id;
              const accent = URGENCY_ACCENTS[level.id];
              return (
                <Pressable
                  key={level.id}
                  onPress={() => handleEmergencySelect(level.id)}
                  style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                >
                  <View
                    style={[
                      styles.urgencyCard,
                      { borderLeftColor: accent.border, borderLeftWidth: 4 },
                      active && {
                        borderColor: accent.border,
                        borderWidth: 2,
                        borderLeftWidth: 4,
                        backgroundColor: accent.bg,
                      },
                    ]}
                  >
                    <View style={styles.urgencyContent}>
                      <Text style={styles.urgencyLabel}>{level.label}</Text>
                      <Text style={styles.urgencyDesc}>{level.description}</Text>
                    </View>
                    {active && (
                      <Ionicons name="checkmark-circle" size={24} color={accent.border} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        {/* ════════════ Step 2 ════════════ */}
        {step === 2 && (
          <>
            <Text style={styles.sectionTitle}>Any special needs?</Text>
            <Text style={styles.sectionSubtitle}>Select all that apply</Text>

            {specialNeeds.map((need) => {
              const active = selectedNeeds.includes(need.id);
              return (
                <Pressable
                  key={need.id}
                  onPress={() => toggleNeed(need.id)}
                  style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                >
                  <View
                    style={[
                      styles.needCard,
                      active && styles.needCardActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.needIconWrap,
                        { backgroundColor: active ? colors.primaryLight : colors.borderLight },
                      ]}
                    >
                      <Ionicons
                        name={need.icon as any}
                        size={26}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.needLabel,
                        active && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {need.label}
                    </Text>
                    <View
                      style={[
                        styles.checkCircle,
                        active && styles.checkCircleActive,
                      ]}
                    >
                      {active && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}

        {/* ════════════ Step 3 ════════════ */}
        {step === 3 && (
          <>
            <Text style={styles.sectionTitle}>Where to?</Text>
            <Text style={styles.sectionSubtitle}>
              Nearby hospitals & clinics
            </Text>

            {/* Search bar */}
            <View style={styles.destinationWrap}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textTertiary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search hospitals..."
                placeholderTextColor={colors.textTertiary}
                style={styles.destinationInput}
              />
            </View>

            {/* Hospital list */}
            {hospitalsLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
              </View>
            ) : (
              <>
                {filteredHospitals.map((hospital) => {
                  const isSelected = selectedHospital?.id === hospital.id;
                  return (
                    <Pressable
                      key={hospital.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedHospital(hospital);
                        setDestination(hospital.name);
                      }}
                      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                    >
                      <View style={[styles.hospitalCard, isSelected && styles.hospitalCardActive]}>
                        <View style={[styles.hospitalIcon, isSelected && { backgroundColor: colors.primaryLight }]}>
                          <Ionicons name="medical" size={20} color={isSelected ? colors.primaryDark : colors.textSecondary} />
                        </View>
                        <View style={styles.hospitalInfo}>
                          <Text style={styles.hospitalName} numberOfLines={1}>{hospital.name}</Text>
                          <Text style={styles.hospitalAddress} numberOfLines={1}>{hospital.address}</Text>
                          <View style={styles.hospitalMeta}>
                            <Ionicons name="navigate" size={12} color={colors.textTertiary} />
                            <Text style={styles.hospitalDistance}>{hospital.distance}</Text>
                            {hospital.rating && (
                              <>
                                <Ionicons name="star" size={12} color="#F59E0B" style={{ marginLeft: 10 }} />
                                <Text style={styles.hospitalRating}>{hospital.rating}</Text>
                              </>
                            )}
                            {hospital.isOpen !== undefined && (
                              <Text style={[styles.hospitalOpen, { color: hospital.isOpen ? colors.secondary : colors.emergency }]}>
                                {hospital.isOpen ? '  Open' : '  Closed'}
                              </Text>
                            )}
                          </View>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primaryDark} />
                        )}
                      </View>
                    </Pressable>
                  );
                })}

                {filteredHospitals.length === 0 && !hospitalsLoading && (
                  <View style={styles.emptyWrap}>
                    <Ionicons name="wifi-outline" size={40} color={colors.textTertiary} />
                    <Text style={styles.emptyText}>Couldn't fetch hospitals</Text>
                    <Text style={[styles.emptyText, { fontSize: 12, marginTop: 4 }]}>Check your internet and try again</Text>
                    <Pressable
                      onPress={loadNearbyHospitals}
                      style={{ marginTop: 16, backgroundColor: colors.primaryLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
                    >
                      <Text style={{ color: colors.primaryDark, fontWeight: '600' }}>Retry</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* Summary */}
            {selectedHospital && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Ride Summary</Text>

                <View style={styles.summaryRow}>
                  <Ionicons name="medical" size={18} color={colors.primary} />
                  <Text style={styles.summaryLabel}>Type</Text>
                  <Text style={styles.summaryValue}>
                    {rideTypes.find((t) => t.id === selectedType)?.label ?? '—'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Ionicons name="speedometer" size={18} color="#F59E0B" />
                  <Text style={styles.summaryLabel}>Urgency</Text>
                  <Text style={styles.summaryValue}>
                    {emergencyLevels.find((l) => l.id === selectedLevel)?.label ?? '—'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Ionicons name="location" size={18} color={colors.secondary} />
                  <Text style={styles.summaryLabel}>To</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {selectedHospital.name}
                  </Text>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Estimated fare</Text>
                  <Text style={styles.fareValue}>₹{Math.round(parseFloat(selectedHospital.distance) * 50 + 50)}–{Math.round(parseFloat(selectedHospital.distance) * 50 + 120)}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Your auto will be matched in ~2 minutes
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomBar}>
        {step < 3 ? (
          <Pressable
            onPress={() => {
              if (step === 1 && (!selectedType || !selectedLevel)) {
                Alert.alert('Select options', 'Please select ride type and urgency level.');
                return;
              }
              setStep(step + 1);
            }}
            disabled={!canContinue}
            style={({ pressed }) => [
              styles.ctaWrapper,
              !canContinue && { opacity: 0.5 },
              pressed && canContinue && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={['#E5B800', '#FFCE00'] as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#0F0F1A" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleBookRide}
            disabled={loading || !canBook}
            style={({ pressed }) => [
              styles.ctaWrapper,
              (!canBook || loading) && { opacity: 0.5 },
              pressed && canBook && !loading && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={['#E5B800', '#FFCE00'] as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {loading ? (
                <ActivityIndicator color="#0F0F1A" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#0F0F1A" style={{ marginRight: 8 }} />
                  <Text style={styles.ctaText}>Book Ride</Text>
                </>
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  stepBadge: {
    backgroundColor: '#FFCE00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    color: '#0F0F1A',
    fontSize: 12,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotInactive: {
    backgroundColor: colors.borderLight,
    borderWidth: 2,
    borderColor: colors.disabled,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressLineInactive: {
    backgroundColor: colors.disabled,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    aspectRatio: 1.15,
    borderRadius: 16,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    ...shadows.sm,
  },
  typeCardActive: {
    borderColor: '#FFCE00',
    borderWidth: 2,
    backgroundColor: '#2D2200',
  },
  typeIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  urgencyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  needCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: 12,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  needCardActive: {
    borderColor: '#FFCE00',
    borderWidth: 2,
    backgroundColor: '#2D2200',
  },
  needIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  needLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.disabled,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  destinationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  destinationInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 65,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fareValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  hospitalCardActive: {
    borderColor: colors.primaryDark,
    backgroundColor: '#FFFEF5',
  },
  hospitalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  hospitalAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hospitalDistance: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  hospitalRating: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  hospitalOpen: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 34,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.md,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
  },
  ctaText: {
    color: '#0F0F1A',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
