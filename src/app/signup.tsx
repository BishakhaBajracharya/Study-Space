import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert(
        'Missing information',
        'Please fill in all fields.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Passwords do not match.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Weak password',
        'Password must be at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      Alert.alert(
        'Account created',
        'Your Study Space account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/' as any),
          },
        ]
      );
    } catch (error: any) {
      console.log('SIGNUP ERROR:', error);

      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists.'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );
      } else if (error.code === 'auth/weak-password') {
        Alert.alert(
          'Weak password',
          'Please choose a stronger password.'
        );
      } else {
        Alert.alert(
          'Sign up failed',
          error.message || 'Something went wrong.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create account ✨</Text>

        <Text style={styles.subtitle}>
          Join your Study Space
        </Text>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color="#6B7280"
            />
          </Pressable>
        </View>

        <Text style={styles.label}>Confirm Password</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password again"
            placeholderTextColor="#6B7280"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />

          <Pressable
            style={styles.eyeButton}
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Ionicons
              name={
                showConfirmPassword
                  ? 'eye-outline'
                  : 'eye-off-outline'
              }
              size={21}
              color="#6B7280"
            />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              Create Account
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>Login</Text>
          </Text>
        </Pressable>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F2',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: -10,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#26332A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 7,
    marginBottom: 25,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26332A',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: '#26332A',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    borderRadius: 12,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#26332A',
  },

  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  button: {
    backgroundColor: '#7A9E7E',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 5,
  },

  loginText: {
    color: '#6B7280',
    fontSize: 13,
  },

  loginLink: {
    color: '#7A9E7E',
    fontWeight: '700',
  },
});