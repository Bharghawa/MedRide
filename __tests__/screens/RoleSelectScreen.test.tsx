import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import RoleSelectScreen from '../../src/screens/auth/RoleSelectScreen';
import { useAuthStore } from '../../src/store/authStore';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('RoleSelectScreen', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { uid: 'test-1', email: 'a@b.com', name: 'Test', phone: '123', role: undefined },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders role selection options', () => {
    const { getByText } = renderWithProvider(<RoleSelectScreen />);
    expect(getByText('How will you use MedRide?')).toBeTruthy();
    expect(getByText('I need a ride')).toBeTruthy();
    expect(getByText("I'm a driver")).toBeTruthy();
  });

  it('selects patient role', async () => {
    const { getByText } = renderWithProvider(<RoleSelectScreen />);
    fireEvent.press(getByText('I need a ride'));

    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe('patient');
    });
  });

  it('selects driver role', async () => {
    const { getByText } = renderWithProvider(<RoleSelectScreen />);
    fireEvent.press(getByText("I'm a driver"));

    await waitFor(() => {
      expect(useAuthStore.getState().user?.role).toBe('driver');
    });
  });
});
