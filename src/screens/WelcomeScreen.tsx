import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Footprints, Mountain } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { GrainOverlay } from '../components/GrainOverlay';
import { TopoBackground } from '../components/TopoBackground';
import { colors, typography, fontFamily, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const SCROLL_TEXT = 'run > bike > swim > walk the distance ';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function ScrollingText() {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = () => {
      translateX.setValue(0);
      Animated.timing(translateX, {
        toValue: -1 * (SCROLL_TEXT.length * 10),
        duration: 8000,
        useNativeDriver: true,
      }).start(() => loop());
    };
    loop();
  }, [translateX]);

  return (
    <View style={styles.scrollWrap} pointerEvents="none">
      <Animated.View style={[styles.scrollRow, { transform: [{ translateX }] }]}>
        <Text style={styles.scrollText}>{SCROLL_TEXT.repeat(3)}</Text>
      </Animated.View>
    </View>
  );
}

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <GrainOverlay />
      <TopoBackground />
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Mountain size={20} color={colors.accent} strokeWidth={2} />
          <Footprints size={18} color={colors.accentLight} strokeWidth={2} style={{ marginLeft: spacing.xs }} />
        </View>
        <View style={styles.orangeBar} />
      </View>
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
          <ScrollingText />
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
  hero: {
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeBar: {
    width: 48,
    height: 3,
    backgroundColor: colors.accent,
    marginTop: spacing.sm,
    borderRadius: 2,
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
  scrollWrap: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  scrollRow: {
    flexDirection: 'row',
  },
  scrollText: {
    fontFamily: fontFamily.medium,
    fontSize: typography.body.fontSize,
    color: colors.accent,
    letterSpacing: 0.5,
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
