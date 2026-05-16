import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';
import { theme } from '../../src/theme';
import ProfileScreen from '../../src/screens/shared/ProfileScreen';
import { useAuthStore } from '../../src/store/authStore';

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { uid: 'u1', email: 'test@t.com', name: 'Test User', phone: '9876543210', role: 'patient' },
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('renders user profile', () => {
    const { getByText } = renderWithProvider(
      <ProfileScreen navigation={mockNavigation} />
    );
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('test@t.com')).toBeTruthy();
  });

  it('has log out button', () => {
    const { getByText } = renderWithProvider(
      <ProfileScreen navigation={mockNavigation} />
    );
    expect(getByText('Log Out')).toBeTruthy();
  });

  it('shows logout confirmation on press', () => {
    const { getByText } = renderWithProvider(
      <ProfileScreen navigation={mockNavigation} />
    );
    fireEvent.press(getByText('Log Out'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Log out',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('has switch role option', () => {
    const { getByText } = renderWithProvider(
      <ProfileScreen navigation={mockNavigation} />
    );
    expect(getByText(/Switch to Driver mode/)).toBeTruthy();
  });
});
