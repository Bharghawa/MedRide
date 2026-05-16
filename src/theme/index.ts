import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 40 },
  displayMedium: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 36 },
  displaySmall: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 32 },
  headlineLarge: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 32 },
  headlineMedium: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28 },
  headlineSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24 },
  titleLarge: { fontFamily: 'Inter_600SemiBold', fontSize: 18, lineHeight: 24 },
  titleMedium: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  titleSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20 },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16 },
  labelLarge: { fontFamily: 'Inter_600SemiBold', fontSize: 16, lineHeight: 22 },
  labelMedium: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 18 },
  labelSmall: { fontFamily: 'Inter_600SemiBold', fontSize: 12, lineHeight: 16 },
};

// ── Rapido Med-Auto Brand System ──────────────────────────
// Light theme for non-emergency medical transport (auto-rickshaw)
export const colors = {
  // Brand — Rapido Yellow
  primary: '#FFCE00',
  primaryDark: '#E5B800',
  primaryLight: '#FFF8D6',
  primaryGradientStart: '#E5B800',
  primaryGradientEnd: '#FFD633',

  // CTA — warm orange
  accent: '#FF8C00',
  accentLight: '#FFF4ED',

  // Success / Verified
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',

  // Emergency — for real emergency contacts only
  emergency: '#EF4444',
  emergencyLight: '#FEE2E2',

  // Info amber
  amber: '#F59E0B',
  amberLight: '#FEF3C7',

  // Surfaces — Light theme
  background: '#FFFFFF',
  surface: '#F8F9FA',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  disabled: '#D1D5DB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
  online: '#22C55E',

  // Extra palette
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  sky: '#0EA5E9',
  skyLight: '#F0F9FF',

  // Driver tier
  certified: '#22C55E',
  certifiedLight: '#F0FDF4',
  uncertified: '#6B7280',
};

export const gradients = {
  primary: ['#E5B800', '#FFCE00'] as const,
  primarySoft: ['#FFFBEB', '#FFF8D6'] as const,
  hero: ['#FFFBEB', '#FFFFFF', '#F8F9FA'] as const,
  accent: ['#FF8C00', '#FFAB40'] as const,
  emergency: ['#DC2626', '#EF4444'] as const,
  success: ['#059669', '#10B981'] as const,
  warm: ['#FFFBEB', '#FFF8D6'] as const,
  dark: ['#1A1A2E', '#252540'] as const,
  rapido: ['#E5B800', '#FFCE00', '#FFD633'] as const,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export const theme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: '#F3F4F6',
    error: colors.emergency,
    onPrimary: '#1A1A2E',
    onSecondary: '#FFFFFF',
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
  },
  fonts: configureFonts({ config: fontConfig, isV3: true }),
  roundness: 14,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export type AppTheme = typeof theme;
