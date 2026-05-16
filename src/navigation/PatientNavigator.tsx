import React, { lazy, Suspense } from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import PatientHomeScreen from '../screens/patient/HomeScreen';
import BookingScreen from '../screens/patient/BookingScreen';
import RideHistoryScreen from '../screens/shared/RideHistoryScreen';
import SOSScreen from '../screens/shared/SOSScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Lazy load ActiveRideScreen (uses react-native-maps)
const LazyActiveRideScreen = lazy(() => import('../screens/patient/ActiveRideScreen'));
function ActiveRideWrapper(props: any) {
  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#FFCE00" /></View>}>
      <LazyActiveRideScreen {...props} />
    </Suspense>
  );
}

export type PatientStackParamList = {
  PatientHome: undefined;
  Booking: undefined;
  ActiveRide: { rideId: string };
};

export type PatientTabParamList = {
  Home: undefined;
  Rides: undefined;
  SOS: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<PatientTabParamList>();
const Stack = createNativeStackNavigator<PatientStackParamList>();

function PatientHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="ActiveRide" component={ActiveRideWrapper} />
    </Stack.Navigator>
  );
}

export default function PatientNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Rides') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'SOS') iconName = focused ? 'call' : 'call-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: '#1A1A2E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={PatientHomeStack} />
      <Tab.Screen name="Rides" component={RideHistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen
        name="SOS"
        component={SOSScreen}
        options={{ tabBarLabel: 'Help' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

