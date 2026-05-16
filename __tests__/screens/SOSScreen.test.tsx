import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import SOSScreen from '../../src/screens/shared/SOSScreen';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('SOSScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders emergency header', () => {
    const { getByText } = renderWithProvider(<SOSScreen />);
    expect(getByText('Emergency SOS')).toBeTruthy();
  });

  it('renders all emergency numbers', () => {
    const { getByText } = renderWithProvider(<SOSScreen />);
    expect(getByText('Call 108')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('101')).toBeTruthy();
    expect(getByText('1091')).toBeTruthy();
  });

  it('renders disclaimer about non-emergency service', () => {
    const { getByText } = renderWithProvider(<SOSScreen />);
    expect(getByText(/non-emergency/i)).toBeTruthy();
  });

  it('renders Call Now button', () => {
    const { getByText } = renderWithProvider(<SOSScreen />);
    expect(getByText('Call Now')).toBeTruthy();
  });
});
