import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export default function AddSubject() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const saveSubject = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Missing information',
        'Enter a subject name.'
      );
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'subjects'), {
        name: name.trim(),
        code: code.trim(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Subject added successfully.'
      );

      router.back();
    } catch (error) {
      console.log('Add subject error:', error);

      Alert.alert(
        'Error',
        'Could not add the subject.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Subject</Text>

      <Text style={styles.label}>Subject Name</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Database Management"
        placeholderTextColor="#6B7280"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Subject Code</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. ITEX201"
        placeholderTextColor="#6B7280"
        value={code}
        onChangeText={setCode}
      />

      <Pressable
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={saveSubject}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save Subject'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F2',
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#26332A',
    marginBottom: 30,
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
    padding: 15,
    marginBottom: 18,
    fontSize: 16,
    color: '#26332A',
  },

  button: {
    backgroundColor: '#7A9E7E',
    padding: 16,
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

  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },

  cancelText: {
    color: '#6B7280',
    fontWeight: '600',
  },
});