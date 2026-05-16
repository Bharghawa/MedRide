import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, gradients } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { signOut } from 'firebase/auth';
import { auth, IS_DEMO_MODE } from '../../config/firebase';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [editing, setEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSave = () => {
    if (!user) return;
    setUser({
      ...user,
      name,
      phone,
      emergencyContact: { name: emergencyName, phone: emergencyPhone },
      vehicleNumber: user.role === 'driver' ? vehicleNumber : undefined,
    });
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          if (!IS_DEMO_MODE && auth) {
            try {
              await signOut(auth);
            } catch (e) {}
          }
          logout();
        },
      },
    ]);
  };

  const handleSwitchRole = () => {
    if (!user) return;
    const newRole = user.role === 'patient' ? 'driver' : 'patient';
    Alert.alert(
      'Switch Role',
      `Switch to ${newRole} mode?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => setUser({ ...user, role: newRole }),
        },
      ]
    );
  };

  const initials = (user?.name || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Gradient Header */}
      <LinearGradient colors={['#FFF8D6', '#FFFFFF']} style={styles.gradientHeader}>
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryGradientEnd]}
            style={styles.avatarCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarInitials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
          <View style={styles.roleBadge}>
            <Ionicons
              name={user?.role === 'driver' ? 'car' : 'heart'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.roleText}>
              {user?.role === 'driver' ? 'Medical Driver' : 'Patient'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Personal Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Personal Info</Text>
          </View>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={editing}
            style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={user?.email || ''}
            editable={false}
            style={[styles.fieldInput, styles.fieldInputDisabled]}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
            style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {user?.role === 'driver' && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Vehicle Number</Text>
            <TextInput
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              editable={editing}
              placeholder="e.g., TS 09 AB 1234"
              style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.cardTitleRow}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.emergency} />
          <Text style={styles.cardTitle}>Emergency Contact</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Name</Text>
          <TextInput
            value={emergencyName}
            onChangeText={setEmergencyName}
            editable={editing}
            style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Phone</Text>
          <TextInput
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            editable={editing}
            keyboardType="phone-pad"
            style={[styles.fieldInput, !editing && styles.fieldInputDisabled]}
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={() => setEditing(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <LinearGradient
                colors={['#E5B800', '#FFCE00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Settings</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.toggleLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.disabled, true: colors.primaryLight }}
            thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.toggleLabel}>Location Services</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: colors.disabled, true: colors.primaryLight }}
            thumbColor={locationEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity onPress={handleSwitchRole} style={styles.switchRoleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons
              name={user?.role === 'driver' ? 'heart-outline' : 'car-outline'}
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.toggleLabel}>
              Switch to {user?.role === 'driver' ? 'Patient' : 'Driver'} Mode
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerCard}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color={colors.emergency} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.appInfo}>
        Rapido Med-Auto v1.0.0 • Non-Emergency Medical Transport
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  card: {
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.cardBg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: '#F9FAFB',
  },
  fieldInputDisabled: {
    backgroundColor: '#F3F4F6',
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  switchRoleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dangerCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.emergencyLight,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.emergency,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.emergency,
  },
  appInfo: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.disabled,
    marginTop: spacing.lg,
  },
});
