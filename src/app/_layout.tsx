import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '../../firebaseConfig';

export default function RootLayout() {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7A9E7E" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#FAF8F2',
        },
      }}
    />
  );
}

const styles = {
  loading: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FAF8F2',
  },
};