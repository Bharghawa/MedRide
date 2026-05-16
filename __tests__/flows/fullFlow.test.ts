/**
 * End-to-End Flow Tests (Integration)
 * Tests the complete user journey through the app
 */
import { useAuthStore } from '../../src/store/authStore';
import { useRideStore } from '../../src/store/rideStore';

describe('Full App Flow - Patient Journey', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
    useRideStore.setState({ currentRide: null, rideHistory: [] });
  });

  it('Complete patient flow: signup → role → book → ride → complete', () => {
    // 1. App loads (loading state)
    expect(useAuthStore.getState().isLoading).toBe(true);

    // 2. Loading finishes, user not authenticated
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // 3. User signs up
    useAuthStore.getState().setUser({
      uid: 'new_patient_1',
      email: 'patient@medride.com',
      name: 'Anitha Reddy',
      phone: '9123456780',
      role: undefined,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.role).toBeUndefined();

    // 4. User selects role → patient
    const user = useAuthStore.getState().user!;
    useAuthStore.getState().setUser({ ...user, role: 'patient' });
    expect(useAuthStore.getState().user?.role).toBe('patient');

    // 5. Patient books a ride
    const ride = {
      id: `ride_${Date.now()}`,
      patientId: 'new_patient_1',
      patientName: 'Anitha Reddy',
      status: 'pending' as const,
      rideType: 'dialysis' as const,
      emergencyLevel: 'medium' as const,
      specialNeeds: ['wheelchair'] as const,
      pickup: { latitude: 17.385, longitude: 78.4867, address: 'Miyapur' },
      destination: { latitude: 17.42, longitude: 78.51, address: 'Yashoda Hospital', hospitalName: 'Yashoda' },
      createdAt: Date.now(),
    };
    useRideStore.getState().setCurrentRide(ride);
    expect(useRideStore.getState().currentRide?.status).toBe('pending');

    // 6. Driver accepts
    useRideStore.getState().updateRideStatus('accepted');
    expect(useRideStore.getState().currentRide?.status).toBe('accepted');

    // 7. Driver arriving
    useRideStore.getState().updateRideStatus('arriving');
    useRideStore.getState().updateDriverLocation({ latitude: 17.386, longitude: 78.487 });
    expect(useRideStore.getState().currentRide?.driverLocation).toBeDefined();

    // 8. Patient picked up
    useRideStore.getState().updateRideStatus('picked_up');

    // 9. In transit
    useRideStore.getState().updateRideStatus('in_transit');

    // 10. Ride completed
    useRideStore.getState().updateRideStatus('completed');
    expect(useRideStore.getState().currentRide?.status).toBe('completed');

    // 11. Clear ride
    useRideStore.getState().setCurrentRide(null);
    expect(useRideStore.getState().currentRide).toBeNull();
  });
});

describe('Full App Flow - Driver Journey', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useRideStore.setState({ currentRide: null, rideHistory: [] });
  });

  it('Complete driver flow: login → role → go online → accept → navigate → complete', () => {
    // 1. Driver logs in
    useAuthStore.getState().setUser({
      uid: 'driver_1',
      email: 'driver@medride.com',
      name: 'Suresh Babu',
      phone: '9988776655',
      role: 'driver',
      vehicleNumber: 'TS09AB1234',
      isOnline: false,
    });
    expect(useAuthStore.getState().user?.role).toBe('driver');

    // 2. Driver goes online
    const driver = useAuthStore.getState().user!;
    useAuthStore.getState().setUser({ ...driver, isOnline: true });
    expect(useAuthStore.getState().user?.isOnline).toBe(true);

    // 3. Incoming ride request
    const ride = {
      id: 'ride_incoming',
      patientId: 'patient_x',
      patientName: 'Meera K',
      status: 'pending' as const,
      rideType: 'hospital_visit' as const,
      emergencyLevel: 'low' as const,
      specialNeeds: ['can_sit'] as const,
      pickup: { latitude: 17.39, longitude: 78.49, address: 'Gachibowli' },
      destination: { latitude: 17.42, longitude: 78.51, address: 'KIMS Hospital', hospitalName: 'KIMS' },
      createdAt: Date.now(),
    };
    useRideStore.getState().setCurrentRide({ ...ride, status: 'accepted', driverId: 'driver_1', driverName: 'Suresh Babu' });

    // 4. Navigate through status flow
    useRideStore.getState().updateRideStatus('arriving');
    useRideStore.getState().updateRideStatus('picked_up');
    useRideStore.getState().updateRideStatus('in_transit');
    useRideStore.getState().updateRideStatus('completed');

    expect(useRideStore.getState().currentRide?.status).toBe('completed');

    // 5. Clear and go offline
    useRideStore.getState().setCurrentRide(null);
    useAuthStore.getState().setUser({ ...useAuthStore.getState().user!, isOnline: false });
    expect(useAuthStore.getState().user?.isOnline).toBe(false);
  });
});

describe('Edge Cases', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useRideStore.setState({ currentRide: null, rideHistory: [] });
  });

  it('should handle update ride status with no current ride', () => {
    // Should not crash
    useRideStore.getState().updateRideStatus('accepted');
    expect(useRideStore.getState().currentRide).toBeNull();
  });

  it('should handle driver location update with no ride', () => {
    useRideStore.getState().updateDriverLocation({ latitude: 17.0, longitude: 78.0 });
    expect(useRideStore.getState().currentRide).toBeNull();
  });

  it('should handle logout while ride is active', () => {
    useAuthStore.getState().setUser({
      uid: 'u1', email: 'a@b.com', name: 'A', phone: '1', role: 'patient',
    });
    useRideStore.getState().setCurrentRide({
      id: 'r1', patientId: 'u1', patientName: 'A', status: 'in_transit',
      rideType: 'hospital_visit', emergencyLevel: 'low', specialNeeds: [],
      pickup: { latitude: 0, longitude: 0, address: '' },
      destination: { latitude: 0, longitude: 0, address: '' },
      createdAt: Date.now(),
    });

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    // Ride store is independent - ride still exists until explicitly cleared
    expect(useRideStore.getState().currentRide).not.toBeNull();
  });
});
