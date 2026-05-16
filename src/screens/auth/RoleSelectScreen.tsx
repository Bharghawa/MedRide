import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db, IS_DEMO_MODE } from '../../config/firebase';
import * as Haptics from 'expo-haptics';

export default function RoleSelectScreen() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'driver' | null>(null);

  const selectRole = async (role: 'patient' | 'driver') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!user) return;
    setSelectedRole(role);
    setLoading(true);
    try {
      if (!IS_DEMO_MODE && db) {
        await updateDoc(doc(db, 'users', user.uid), { role });
      }
      setUser({ ...user, role });
    } catch (e) {
      // Fallback — set locally even if Firestore fails
      setUser({ ...user, role });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#EFF6FF', '#F5F3FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>🏥</Text>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you'd like to use MedRide
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.cards}>
          {/* Patient Card */}
          <Pressable
            onPress={() => selectRole('patient')}
            style={({ pressed }) => [
              styles.card,
              selectedRole === 'patient' && styles.cardSelected,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <LinearGradient
                colors={['#DBEAFE', '#BFDBFE']}
                style={styles.iconCircle}
              >
                <Ionicons name="heart" size={32} color={colors.primary} />
              </LinearGradient>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>I Need a Ride</Text>
                <Text style={styles.cardDescription}>
                  Book safe, comfortable transport to hospitals & clinics
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.textTertiary}
                style={styles.arrow}
              />
            </View>
          </Pressable>

          {/* Driver Card */}
          <Pressable
            onPress={() => selectRole('driver')}
            style={({ pressed }) => [
              styles.card,
              selectedRole === 'driver' && styles.cardSelected,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardContent}>
              <LinearGradient
                colors={['#D1FAE5', '#A7F3D0']}
                style={styles.iconCircle}
              >
                <Ionicons name="car-sport" size={32} color={colors.secondary} />
              </LinearGradient>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>I'm a Driver</Text>
                <Text style={styles.cardDescription}>
                  Help patients reach care safely and earn income
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.textTertiary}
                style={styles.arrow}
              />
            </View>
          </Pressable>
        </View>
      )}

      <Text style={styles.footer}>
        MedRide • Non-Emergency Medical Transport
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cards: {
    gap: spacing.lg,
  },
  card: {
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 140,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    transform: [{ scale: 1.02 }],
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  arrow: {
    alignSelf: 'center',
  },
  footer: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: spacing.xl,
  },
});
