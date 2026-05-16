import { useRideStore, Ride } from '../../src/store/rideStore';

describe('RideStore', () => {
  beforeEach(() => {
    useRideStore.setState({
      currentRide: null,
      rideHistory: [],
    });
  });

  const mockRide: Ride = {
    id: 'ride_001',
    patientId: 'patient_1',
    patientName: 'Priya Sharma',
    status: 'pending',
    rideType: 'hospital_visit',
    emergencyLevel: 'low',
    specialNeeds: ['can_sit'],
    pickup: { latitude: 17.385, longitude: 78.4867, address: 'Home' },
    destination: { latitude: 17.39, longitude: 78.49, address: 'Apollo Hospital', hospitalName: 'Apollo' },
    createdAt: Date.now(),
  };

  it('should start with no current ride', () => {
    expect(useRideStore.getState().currentRide).toBeNull();
    expect(useRideStore.getState().rideHistory).toEqual([]);
  });

  it('should set current ride', () => {
    useRideStore.getState().setCurrentRide(mockRide);
    expect(useRideStore.getState().currentRide).toEqual(mockRide);
  });

  it('should update ride status', () => {
    useRideStore.getState().setCurrentRide(mockRide);
    useRideStore.getState().updateRideStatus('accepted');
    expect(useRideStore.getState().currentRide?.status).toBe('accepted');
  });

  it('should update driver location', () => {
    useRideStore.getState().setCurrentRide(mockRide);
    useRideStore.getState().updateDriverLocation({ latitude: 17.4, longitude: 78.5 });
    const ride = useRideStore.getState().currentRide;
    expect(ride?.driverLocation?.latitude).toBe(17.4);
    expect(ride?.driverLocation?.longitude).toBe(78.5);
  });

  it('should handle full ride lifecycle', () => {
    const { setCurrentRide, updateRideStatus } = useRideStore.getState();

    // Book ride
    setCurrentRide(mockRide);
    expect(useRideStore.getState().currentRide?.status).toBe('pending');

    // Driver accepts
    updateRideStatus('accepted');
    expect(useRideStore.getState().currentRide?.status).toBe('accepted');

    // Driver arriving
    updateRideStatus('arriving');
    expect(useRideStore.getState().currentRide?.status).toBe('arriving');

    // Patient picked up
    updateRideStatus('picked_up');
    expect(useRideStore.getState().currentRide?.status).toBe('picked_up');

    // In transit
    updateRideStatus('in_transit');
    expect(useRideStore.getState().currentRide?.status).toBe('in_transit');

    // Completed
    updateRideStatus('completed');
    expect(useRideStore.getState().currentRide?.status).toBe('completed');
  });

  it('should clear current ride', () => {
    useRideStore.getState().setCurrentRide(mockRide);
    useRideStore.getState().setCurrentRide(null);
    expect(useRideStore.getState().currentRide).toBeNull();
  });

  it('should set ride history', () => {
    const history = [mockRide, { ...mockRide, id: 'ride_002', status: 'completed' as const }];
    useRideStore.getState().setRideHistory(history);
    expect(useRideStore.getState().rideHistory).toHaveLength(2);
  });
});
