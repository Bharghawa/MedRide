import { create } from 'zustand';

export type UserRole = 'patient' | 'driver' | null;

// Med-Captain certification tiers
export type CertificationStatus = 'none' | 'applied' | 'training' | 'certified';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  emergencyContact?: { name: string; phone: string };
  // Driver-specific
  vehicleNumber?: string;
  isOnline?: boolean;
  // Med-Captain tier (only for drivers)
  certificationStatus?: CertificationStatus;
  isMedCaptain?: boolean;
  medCaptainSince?: number;
  trainingCompletedModules?: number;
  totalTrainingModules?: number;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Auto-login for demo/development
const DEMO_USER: UserProfile | null = {
  uid: 'demo_patient_1',
  name: 'Demo Patient',
  email: 'demo@rapidomedauto.in',
  phone: '+91 9876543210',
  role: 'patient',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEMO_USER,
  isAuthenticated: !!DEMO_USER,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
