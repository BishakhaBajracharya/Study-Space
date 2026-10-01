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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.replace('/(tabs)/' as any);
    } catch (error: any) {
      console.log('LOGIN ERROR:', error);

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        Alert.alert(
          'Login failed',
          'Email or password is incorrect.'
        );
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'Invalid email',
          'Please enter a valid email address.'
        );
      } else {
        Alert.alert(
          'Login failed',
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

        <Text style={styles.title}>Welcome Back 👋</Text>

        <Text style={styles.subtitle}>
          Login to your Study Space
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
            placeholder="Enter your password"
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

        <Pressable
          style={[
            styles.button,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.signupButton}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink}>
              Sign up
            </Text>
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
    transform: [{ translateY: -30 }],
  },

  logo: {
    width: 190,
    height: 190,
    alignSelf: 'center',
    marginBottom: -15,
    transform: [{ translateY: -25 }],
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#26332A',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 7,
    marginBottom: 30,
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
    marginBottom: 17,
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
    marginBottom: 17,
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

  signupButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 5,
  },

  signupText: {
    color: '#6B7280',
    fontSize: 13,
  },

  signupLink: {
    color: '#7A9E7E',
    fontWeight: '700',
  },
});