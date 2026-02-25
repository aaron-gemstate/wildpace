import React, { useCallback, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { AppProvider } from './src/store/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

export default function App() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppProvider>
        <NavigationContainer onReady={onLayoutRootView}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AppProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? { minHeight: '100vh' as unknown as number } : {}),
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
