import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { GrainOverlay } from '../components/GrainOverlay';
import { TopoBackground } from '../components/TopoBackground';
import { colors, typography, fontFamily, spacing, theme } from '../theme';
import { useApp } from '../store/AppContext';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function AuthScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn, signUp, signInWithGoogle, loading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      let msg = 'Google Sign-In failed.';
      if (e && typeof e === 'object' && 'message' in e) msg = String((e as { message: string }).message);
      if (e && typeof e === 'object' && 'code' in e) {
        const code = (e as { code: string }).code;
        if (code === 'auth/popup-closed-by-user') return;
        if (code === 'auth/popup-blocked') msg = 'Popup was blocked. Allow popups and try again.';
      }
      Alert.alert('Error', msg);
    }
  };

  const submit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Email and password required.');
      return;
    }
    if (isSignUp && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    try {
      if (isSignUp) await signUp(trimmedEmail, password);
      else await signIn(trimmedEmail, password);
    } catch (e: unknown) {
      let msg = 'Sign-up failed.';
      if (e && typeof e === 'object') {
        const obj = e as { code?: string; message?: string };
        if (obj.code === 'auth/operation-not-allowed') {
          msg =
            'Email/Password is not enabled. In Firebase Console go to: Authentication → Sign-in method → Email/Password → Enable.';
        } else if (obj.code === 'auth/invalid-email') {
          msg = 'Invalid email address.';
        } else if (obj.code === 'auth/weak-password') {
          msg = 'Password must be at least 6 characters.';
        } else if (obj.code === 'auth/email-already-in-use') {
          msg = 'This email is already registered. Try signing in.';
        } else if (obj.message) {
          msg = String(obj.message);
        }
      } else if (e instanceof Error) {
        msg = e.message;
      }
      // 400 from Identity Toolkit usually means Email/Password not enabled
      if (msg.toLowerCase().includes('bad request') || msg.includes('400')) {
        msg =
          'Server returned 400. Enable Email/Password in Firebase Console: Authentication → Sign-in method → Email/Password → Enable.';
      }
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <GrainOverlay />
      <TopoBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <View style={styles.form}>
          <PrimaryButton
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={loading}
            variant="outline"
            style={styles.googleButton}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
          <PrimaryButton
            title={isSignUp ? 'Create account' : 'Sign in'}
            onPress={submit}
            loading={loading}
            style={styles.button}
          />
          <PrimaryButton
            title={isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            onPress={() => setIsSignUp((v) => !v)}
            variant="outline"
            style={styles.buttonSecondary}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  form: {
    padding: spacing.xl,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: typography.caption.fontSize,
    letterSpacing: 0.3,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
    minHeight: 52,
  },
  googleButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
  buttonSecondary: {
    marginTop: spacing.md,
  },
});
