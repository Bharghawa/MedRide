import { useAuthStore } from '../../src/store/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('should start with no user and loading true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('should set user and mark authenticated', () => {
    const mockUser = {
      uid: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      phone: '9876543210',
      role: 'patient' as const,
    };
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear user', () => {
    useAuthStore.getState().setUser({
      uid: 'test-123',
      email: 'test@example.com',
      name: 'Test',
      phone: '123',
      role: 'patient',
    });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle role switching', () => {
    const user = {
      uid: 'u1',
      email: 'a@b.com',
      name: 'A',
      phone: '111',
      role: 'patient' as const,
    };
    useAuthStore.getState().setUser(user);
    expect(useAuthStore.getState().user?.role).toBe('patient');

    useAuthStore.getState().setUser({ ...user, role: 'driver' });
    expect(useAuthStore.getState().user?.role).toBe('driver');
  });
});
