import React from 'react';
import { render } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../../src/theme';
import RideHistoryScreen from '../../src/screens/shared/RideHistoryScreen';

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider theme={theme}>{component}</PaperProvider>);
};

describe('RideHistoryScreen', () => {
  it('renders ride history title', () => {
    const { getByText } = renderWithProvider(<RideHistoryScreen />);
    expect(getByText('Your Rides')).toBeTruthy();
  });

  it('shows demo rides with hospital names', () => {
    const { getByText } = renderWithProvider(<RideHistoryScreen />);
    expect(getByText('Apollo Hospital')).toBeTruthy();
    expect(getByText('Care Hospital')).toBeTruthy();
  });

  it('shows ride status badges as Done', () => {
    const { getAllByText } = renderWithProvider(<RideHistoryScreen />);
    const doneBadges = getAllByText('Done');
    expect(doneBadges.length).toBeGreaterThan(0);
  });
});
