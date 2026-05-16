import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import LoginScreen from '../../src/screens/auth/LoginScreen';
import { useAuthStore } from '../../src/store/authStore';

const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate, goBack: jest.fn() };

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('renders login form', () => {
    const { getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );
    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows error when fields are empty', async () => {
    const { getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );
    fireEvent.press(getByText('Sign In'));
    await waitFor(() => {
      expect(getByText('Please fill in all fields')).toBeTruthy();
    });
  });

  it('navigates to signup screen', () => {
    const { getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );
    fireEvent.press(getByText(/Sign Up/));
    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });

  it('logs in successfully in demo mode', async () => {
    const { getByText, getAllByTestId } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );
    
    // Paper TextInput uses testID="text-input-outlined"
    const inputs = getAllByTestId('text-input-outlined');
    fireEvent.changeText(inputs[0], 'test@demo.com'); // Email
    fireEvent.changeText(inputs[1], 'password123'); // Password
    fireEvent.press(getByText('Sign In'));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe('test@demo.com');
    });
  });
});
