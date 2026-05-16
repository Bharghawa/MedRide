import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import BookingScreen from '../../src/screens/patient/BookingScreen';
import { useAuthStore } from '../../src/store/authStore';
import { useRideStore } from '../../src/store/rideStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: mockGoBack };

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('BookingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: { uid: 'p1', email: 'p@t.com', name: 'Patient', phone: '111', role: 'patient' },
      isAuthenticated: true,
      isLoading: false,
    });
    useRideStore.setState({ currentRide: null, rideHistory: [] });
  });

  it('renders step 1 - ride type selection', () => {
    const { getByText } = renderWithProvider(
      <BookingScreen navigation={mockNavigation} route={{ params: {} }} />
    );
    expect(getByText('What do you need?')).toBeTruthy();
  });

  it('shows ride type options', () => {
    const { getByText } = renderWithProvider(
      <BookingScreen navigation={mockNavigation} route={{ params: {} }} />
    );
    expect(getByText('Hospital Visit')).toBeTruthy();
    expect(getByText('Dialysis')).toBeTruthy();
    expect(getByText('Checkup')).toBeTruthy();
  });

  it('shows urgency levels', () => {
    const { getByText } = renderWithProvider(
      <BookingScreen navigation={mockNavigation} route={{ params: {} }} />
    );
    expect(getByText('Low')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
  });

  it('moves to step 2 after selecting type and level', async () => {
    const { getByText } = renderWithProvider(
      <BookingScreen navigation={mockNavigation} route={{ params: {} }} />
    );

    // Select ride type
    fireEvent.press(getByText('Hospital Visit'));
    // Select urgency level
    fireEvent.press(getByText('Low'));
    // Press continue
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(getByText('Do you need any support?')).toBeTruthy();
    });
  });
});
