import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, IS_DEMO_MODE } from '../../config/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (IS_DEMO_MODE) {
        // Demo mode: skip Firebase, log in locally
        setUser({
          uid: `demo_${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim(),
          phone: '+91 9876543210',
          role: null,
        });
        return;
      }
      const cred = await signInWithEmailAndPassword(auth!, email.trim(), password);
      const userDoc = await getDoc(doc(db!, 'users', cred.user.uid));
      if (userDoc.exists()) {
        setUser({ uid: cred.user.uid, ...userDoc.data() } as any);
      } else {
        setUser({
          uid: cred.user.uid,
          name: '',
          email: cred.user.email || '',
          phone: '',
          role: null,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
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
          colors={['#FFF8D6', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.brandContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="car" size={36} color="#E5B800" />
            </View>
            <Text style={styles.brandName}>Rapido Med-Auto</Text>
            <Text style={styles.brandTagline}>Your ride to the clinic</Text>
          </View>
        </LinearGradient>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
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
            left={<TextInput.Icon icon="lock-outline" />}
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

          {/* Forgot Password */}
          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Gradient Sign In Button */}
          <Pressable
            onPress={handleLogin}
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
                <Text style={styles.gradientButtonLabel}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupHint}>New to Rapido Med-Auto? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create Account</Text>
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
    backgroundColor: '#FFF0B3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A2E',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: '#6B7280',
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

  /* ── Forgot Password ─────────────────────── */
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
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

  /* ── Sign Up Link ────────────────────────── */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  signupHint: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
