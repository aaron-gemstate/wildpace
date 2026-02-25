import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { GrainOverlay } from '../components/GrainOverlay';
import { TopoBackground } from '../components/TopoBackground';
import { colors, typography, fontFamily, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const CYCLING_WORDS = ['Run', 'Swim', 'Bike', 'Walk'] as const;
const CYCLE_DURATION_MS = 2200;

function CyclingHeadline() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const advance = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % CYCLING_WORDS.length);
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start();
      });
    };
    const id = setInterval(advance, CYCLE_DURATION_MS);
    return () => clearInterval(id);
  }, [opacity]);

  const word = CYCLING_WORDS[index];

  return (
    <View style={styles.cyclingWrap}>
      <Animated.Text style={[styles.cyclingWord, { opacity }]}>{word}</Animated.Text>
      <Text style={styles.cyclingStatic}> the distance</Text>
    </View>
  );
}

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GrainOverlay />
      <TopoBackground />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/logos/wildpace-orange.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="WildPace"
          />
        </View>
        <View style={styles.sublineWrap}>
          <CyclingHeadline />
          <Text style={styles.subline}>
            Your personal coach for achieving all of your endurance dreams.
          </Text>
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            title="Let's Go!"
            onPress={() => navigation.navigate('Auth')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.screen,
    overflow: 'visible',
  },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: spacing.md,
    width: 360,
    height: 360 * (528 / 725),
    overflow: 'visible',
  },
  logo: {
    width: 360,
    height: 360 * (528 / 725),
  },
  sublineWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  cyclingWrap: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cyclingWord: {
    fontFamily: fontFamily.h2,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    color: colors.accent,
  },
  cyclingStatic: {
    fontFamily: fontFamily.h2,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
    color: colors.textSecondary,
  },
  subline: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.textSecondary,
    maxWidth: 340,
    textAlign: 'center',
  },
  actions: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
