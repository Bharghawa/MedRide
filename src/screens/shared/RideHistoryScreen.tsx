import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../theme';
import { useRideStore } from '../../store/rideStore';

const demoRides = [
  {
    id: '1',
    patientId: 'demo',
    status: 'completed',
    rideType: 'hospital_visit',
    emergencyLevel: 'low',
    specialNeeds: [],
    pickup: { latitude: 17.385, longitude: 78.4867, address: 'Home' },
    destination: { latitude: 17.39, longitude: 78.49, hospitalName: 'Apollo Hospital', address: 'Apollo Hospital' },
    createdAt: Date.now() - 86400000,
    fare: 85,
  },
  {
    id: '2',
    patientId: 'demo',
    status: 'completed',
    rideType: 'dialysis',
    emergencyLevel: 'medium',
    specialNeeds: [],
    pickup: { latitude: 17.385, longitude: 78.4867, address: 'Home' },
    destination: { latitude: 17.39, longitude: 78.49, hospitalName: 'Care Hospital', address: 'Care Hospital' },
    createdAt: Date.now() - 172800000,
    fare: 120,
  },
  {
    id: '3',
    patientId: 'demo',
    status: 'completed',
    rideType: 'checkup',
    emergencyLevel: 'low',
    specialNeeds: [],
    pickup: { latitude: 17.385, longitude: 78.4867, address: 'Home' },
    destination: { latitude: 17.39, longitude: 78.49, hospitalName: 'KIMS Hospital', address: 'KIMS Hospital' },
    createdAt: Date.now() - 259200000,
    fare: 65,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return colors.secondary;
    case 'pending': case 'searching': case 'accepted': return colors.amber;
    case 'cancelled': return colors.emergency;
    default: return colors.textTertiary;
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'completed': return colors.secondaryLight;
    case 'pending': case 'searching': case 'accepted': return colors.amberLight;
    case 'cancelled': return colors.emergencyLight;
    default: return colors.borderLight;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'pending': case 'searching': return 'Pending';
    case 'accepted': return 'In Progress';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
};

export default function RideHistoryScreen() {
  const rideHistory = useRideStore((s) => s.rideHistory);
  const rides = rideHistory.length > 0 ? rideHistory : demoRides;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRideIcon = (type: string) => {
    switch (type) {
      case 'dialysis': return 'water';
      case 'checkup': return 'clipboard';
      case 'feeling_unwell': return 'thermometer';
      default: return 'medical';
    }
  };

  const getRideLabel = (type: string) => {
    switch (type) {
      case 'dialysis': return 'Dialysis';
      case 'checkup': return 'Checkup';
      case 'feeling_unwell': return 'Feeling Unwell';
      case 'hospital_visit': return 'Hospital Visit';
      default: return 'Medical Ride';
    }
  };

  const renderRide = ({ item }: any) => (
    <View style={styles.rideCard}>
      {/* Status dot */}
      <View style={styles.statusDotColumn}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
      </View>

      <View style={styles.rideContent}>
        {/* Top row: ride type + date */}
        <View style={styles.rideTopRow}>
          <View style={styles.rideTypeRow}>
            <Ionicons name={getRideIcon(item.rideType)} size={16} color={colors.primary} />
            <Text style={styles.rideTypeLabel}>{getRideLabel(item.rideType)}</Text>
          </View>
          <Text style={styles.rideDate}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Middle: From → To with dotted connector */}
        <View style={styles.routeSection}>
          <View style={styles.routeRow}>
            <View style={styles.routeDotGreen} />
            <Text style={styles.routeAddress} numberOfLines={1}>{item.pickup.address}</Text>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.dottedLine} />
          </View>
          <View style={styles.routeRow}>
            <View style={styles.routeDotRed} />
            <Text style={styles.routeAddress} numberOfLines={1}>{item.destination.hospitalName || item.destination.address}</Text>
          </View>
        </View>

        {/* Bottom: Status badge + fare */}
        <View style={styles.rideBottomRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
            <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          <Text style={styles.rideFare}>₹{item.fare}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <LinearGradient
          colors={['#E5B800', '#FFCE00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentLine}
        />
      </View>

      <FlatList
        data={rides}
        keyExtractor={(item: any) => item.id}
        renderItem={renderRide}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="car-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptySubtext}>Your past medical rides will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accentLine: {
    height: 3,
    width: 50,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  rideCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statusDotColumn: {
    paddingTop: 4,
    paddingRight: spacing.md,
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rideContent: {
    flex: 1,
  },
  rideTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rideTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rideTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rideDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  routeSection: {
    marginBottom: spacing.sm,
    paddingLeft: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  routeDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.emergency,
  },
  routeConnector: {
    paddingLeft: 3,
    height: 16,
    justifyContent: 'center',
  },
  dottedLine: {
    width: 2,
    height: 14,
    borderLeftWidth: 2,
    borderLeftColor: colors.disabled,
    borderStyle: 'dashed',
  },
  routeAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  rideBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rideFare: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
