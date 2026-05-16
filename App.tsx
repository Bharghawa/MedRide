import React, { useCallback, useEffect, useState } from 'react';
import { View, Text as RNText } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useAuthStore } from './src/store/authStore';

// Keep the splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const setLoading = useAuthStore((s) => s.setLoading);
  const [appReady, setAppReady] = useState(false);
  const [debugMsg, setDebugMsg] = useState('Starting...');

  console.log('📱 App component rendering...');

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    console.log('📱 Fonts loaded:', fontsLoaded, 'Font error:', fontError);
    setDebugMsg(`Fonts: ${fontsLoaded ? 'YES' : 'loading...'} ${fontError ? 'ERROR: ' + fontError : ''}`);
  }, [fontsLoaded, fontError]);

  // Always hide splash screen after a max timeout to prevent permanent blank screen
  useEffect(() => {
    const splashTimer = setTimeout(async () => {
      console.log('📱 Force-hiding splash screen after timeout');
      await SplashScreen.hideAsync().catch(() => {});
    }, 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    console.log('📱 Setting auth loading to false in 1s...');
    const timer = setTimeout(() => {
      setLoading(false);
      console.log('📱 Auth loading set to false');
      setAppReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      console.log('📱 Hiding splash screen...');
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // If fonts fail, still show the app (fallback to system font)
  if (!fontsLoaded && !fontError) {
    console.log('📱 Waiting for fonts...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
        <RNText style={{ fontSize: 18, color: '#FFCE00' }}>Rapido Med-Auto</RNText>
        <RNText style={{ fontSize: 12, color: '#A1A1AA', marginTop: 8 }}>{debugMsg}</RNText>
      </View>
    );
  }

  console.log('📱 Rendering full app. appReady:', appReady);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <StatusBar style="dark" />
            <AppNavigator />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
