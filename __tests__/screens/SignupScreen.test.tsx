import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import SignupScreen from '../../src/screens/auth/SignupScreen';
import { useAuthStore } from '../../src/store/authStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: mockGoBack };

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('renders signup form', () => {
    const { getAllByText } = renderWithProvider(
      <SignupScreen navigation={mockNavigation} />
    );
    expect(getAllByText('Create Account').length).toBeGreaterThan(0);
    expect(getAllByText('Full Name').length).toBeGreaterThan(0);
    expect(getAllByText('Email').length).toBeGreaterThan(0);
    expect(getAllByText('Phone Number').length).toBeGreaterThan(0);
    expect(getAllByText('Password').length).toBeGreaterThan(0);
  });

  it('shows error for incomplete form', async () => {
    const { getByText, getAllByText } = renderWithProvider(
      <SignupScreen navigation={mockNavigation} />
    );
    // The button text "Create Account" appears as title too, get the button
    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]); // press the button (last one)
    await waitFor(() => {
      expect(getByText('Please fill in all fields')).toBeTruthy();
    });
  });

  it('creates account in demo mode', async () => {
    const { getAllByTestId, getAllByText } = renderWithProvider(
      <SignupScreen navigation={mockNavigation} />
    );
    
    const inputs = getAllByTestId('text-input-outlined');
    fireEvent.changeText(inputs[0], 'Ravi Kumar'); // Name
    fireEvent.changeText(inputs[1], 'ravi@test.com'); // Email
    fireEvent.changeText(inputs[2], '9876543210'); // Phone
    fireEvent.changeText(inputs[3], 'secure123'); // Password
    
    const buttons = getAllByText('Create Account');
    fireEvent.press(buttons[buttons.length - 1]);

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('Ravi Kumar');
    });
  });
});
