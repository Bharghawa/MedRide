import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, IS_DEMO_MODE } from '../../config/firebase';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (IS_DEMO_MODE) {
        // Demo mode: skip Firebase, create user locally
        setUser({
          uid: `demo_${Date.now()}`,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: null,
        });
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
      const userData = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: null,
        createdAt: Date.now(),
      };
      await setDoc(doc(db!, 'users', cred.user.uid), userData);
      setUser(userData as any);
    } catch (e: any) {
      setError(e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#0F0F1A', '#1A1A2E', '#252540']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.brandContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={36} color="#FFCE00" />
            </View>
            <Text style={styles.brandName}>Join Rapido Med-Auto</Text>
            <Text style={styles.brandTagline}>Create your account</Text>
          </View>
        </LinearGradient>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            left={<TextInput.Icon icon={() => <Ionicons name="person-outline" size={20} color={colors.textSecondary} />} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon={() => <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon={() => <Ionicons name="call-outline" size={20} color={colors.textSecondary} />} />}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon={() => <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            outlineStyle={styles.inputOutline}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            textColor={colors.textPrimary}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Gradient Create Account Button */}
          <Pressable
            onPress={handleSignup}
            disabled={loading}
            style={({ pressed }) => [
              styles.gradientButtonWrapper,
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={['#E5B800', '#FFCE00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {loading ? (
                <ActivityIndicator color="#0F0F1A" size="small" />
              ) : (
                <Text style={styles.gradientButtonLabel}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Sign In Link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinHint}>Already have an account? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.signinLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },

  /* ── Gradient Header ─────────────────────── */
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40%',
  },
  brandContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,206,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },

  /* ── Card ─────────────────────────────────── */
  card: {
    marginTop: -30,
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    ...shadows.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  /* ── Inputs ──────────────────────────────── */
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#252540',
  },
  inputOutline: {
    borderRadius: 12,
  },

  /* ── Error ────────────────────────────────── */
  error: {
    color: colors.emergency,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  /* ── Gradient Button ─────────────────────── */
  gradientButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: spacing.sm,
    ...shadows.colored(colors.primary),
  },
  gradientButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButtonLabel: {
    color: '#0F0F1A',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── Sign In Link ────────────────────────── */
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signinHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
