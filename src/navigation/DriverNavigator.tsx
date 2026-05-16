import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows } from '../theme';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import RideRequestScreen from '../screens/driver/RideRequestScreen';
import NavigationScreen from '../screens/driver/NavigationScreen';
import RideHistoryScreen from '../screens/shared/RideHistoryScreen';
import SOSScreen from '../screens/shared/SOSScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

export type DriverStackParamList = {
  DriverHome: undefined;
  RideRequest: { rideId: string };
  Navigation: { rideId: string };
};

export type DriverTabParamList = {
  Home: undefined;
  Rides: undefined;
  SOS: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DriverTabParamList>();
const Stack = createNativeStackNavigator<DriverStackParamList>();

function DriverHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
      <Stack.Screen name="RideRequest" component={RideRequestScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
}

function SOSTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sosTabBtn,
        pressed && { transform: [{ scale: 0.92 }] },
      ]}
    >
      <LinearGradient colors={['#E11D48', '#F43F5E']} style={styles.sosTabGradient}>
        <Ionicons name="pulse" size={26} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
}

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'car-sport' : 'car-sport-outline';
          else if (route.name === 'Rides') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopWidth: 1,
          borderTopColor: '#2D2D44',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={DriverHomeStack} />
      <Tab.Screen name="Rides" component={RideHistoryScreen} />
      <Tab.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          tabBarButton: (props) => <SOSTabButton onPress={props.onPress} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  sosTabBtn: {
    top: -18,
    width: 60,
    height: 60,
    borderRadius: 30,
    ...shadows.colored('#E11D48'),
  },
  sosTabGradient: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
