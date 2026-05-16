import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PatientNavigator from './PatientNavigator';

// Lazy load DriverNavigator (uses react-native-maps heavily)
const LazyDriverNavigator = lazy(() => import('./DriverNavigator'));
function DriverMain() {
  return (
    <Suspense fallback={<View style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#FFCE00" size="large" /></View>}>
      <LazyDriverNavigator />
    </Suspense>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#FFCE00',
    text: '#1A1A2E',
  },
};

export type RootStackParamList = {
  Auth: undefined;
  RoleSelect: undefined;
  PatientMain: undefined;
  DriverMain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  console.log('🧭 AppNavigator: isLoading=', isLoading, 'isAuth=', isAuthenticated, 'role=', user?.role);

  if (isLoading) {
    console.log('🧭 Showing LoadingScreen');
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !user?.role ? (
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        ) : user.role === 'patient' ? (
          <Stack.Screen name="PatientMain" component={PatientNavigator} />
        ) : (
          <Stack.Screen name="DriverMain" component={DriverMain} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
