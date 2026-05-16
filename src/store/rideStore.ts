import { create } from 'zustand';

export type RideStatus =
  | 'pending'
  | 'accepted'
  | 'arriving'
  | 'picked_up'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

export type EmergencyLevel = 'low' | 'medium' | 'high';

export type RideType =
  | 'hospital_visit'
  | 'dialysis'
  | 'checkup'
  | 'feeling_unwell'
  | 'other';

export type SpecialNeed = 'can_sit' | 'need_helper' | 'wheelchair_support';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Ride {
  id: string;
  patientId: string;
  driverId?: string;
  status: RideStatus;
  rideType: RideType;
  emergencyLevel: EmergencyLevel;
  specialNeeds: SpecialNeed[];
  pickup: Location;
  destination: Location & { hospitalName?: string };
  driverLocation?: Location;
  fare?: number;
  createdAt: number;
  completedAt?: number;
  rating?: number;
  patientName?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
}

interface RideState {
  currentRide: Ride | null;
  rideHistory: Ride[];
  setCurrentRide: (ride: Ride | null) => void;
  updateRideStatus: (status: RideStatus) => void;
  updateDriverLocation: (location: Location) => void;
  setRideHistory: (rides: Ride[]) => void;
}

export const useRideStore = create<RideState>((set) => ({
  currentRide: null,
  rideHistory: [],
  setCurrentRide: (currentRide) => set({ currentRide }),
  updateRideStatus: (status) =>
    set((state) => ({
      currentRide: state.currentRide
        ? { ...state.currentRide, status }
        : null,
    })),
  updateDriverLocation: (location) =>
    set((state) => ({
      currentRide: state.currentRide
        ? { ...state.currentRide, driverLocation: location }
        : null,
    })),
  setRideHistory: (rideHistory) => set({ rideHistory }),
}));
