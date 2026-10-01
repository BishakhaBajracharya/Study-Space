import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export default function AddSession() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const saveSession = async () => {
    if (
      !subject.trim() ||
      !date.trim() ||
      !time.trim() ||
      !duration.trim()
    ) {
      Alert.alert(
        'Missing information',
        'Please enter subject, date, time and duration.'
      );
      return;
    }

    const durationNumber = Number(duration);

    if (Number.isNaN(durationNumber) || durationNumber <= 0) {
      Alert.alert(
        'Invalid duration',
        'Enter a valid duration in minutes.'
      );
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'sessions'), {
        subject: subject.trim(),
        topic: topic.trim(),
        date: date.trim(),
        time: time.trim(),
        duration: durationNumber,
        completed: false,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Study session added successfully.'
      );

      router.back();
    } catch (error) {
      console.log('Add session error:', error);

      Alert.alert(
        'Error',
        'Could not add the study session.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Add Study Session</Text>
          <Text style={styles.subtitle}>
            Plan what you want to study
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Database Management"
          placeholderTextColor="#9AA19B"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Normalization"
          placeholderTextColor="#9AA19B"
          value={topic}
          onChangeText={setTopic}
        />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-09-30"
          placeholderTextColor="#9AA19B"
          value={date}
          onChangeText={setDate}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 02:00 PM"
          placeholderTextColor="#9AA19B"
          value={time}
          onChangeText={setTime}
        />

        <Text style={styles.label}>Duration</Text>

        <View style={styles.durationRow}>
          <TextInput
            style={styles.durationInput}
            placeholder="60"
            placeholderTextColor="#9AA19B"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />

          <View style={styles.minutesBox}>
            <Text style={styles.minutesText}>minutes</Text>
          </View>
        </View>
      </View>

      {/* Save */}
      <Pressable
        style={[
          styles.saveButton,
          loading && styles.buttonDisabled,
        ]}
        onPress={saveSession}
        disabled={loading}
      >
        <Text style={styles.saveText}>
          {loading ? 'Saving...' : 'Save Session'}
        </Text>
      </Pressable>

      {/* Cancel */}
      <Pressable
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F2',
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  backText: {
    fontSize: 31,
    color: '#58745C',
    marginTop: -4,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#26332A',
  },

  subtitle: {
    fontSize: 13,
    color: '#7B827C',
    marginTop: 4,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 19,
    elevation: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#39463C',
    marginBottom: 7,
  },

  input: {
    height: 50,
    backgroundColor: '#FAF8F2',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#26332A',
    marginBottom: 17,
  },

  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },

  durationInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FAF8F2',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#26332A',
  },

  minutesBox: {
    width: 100,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  minutesText: {
    color: '#58745C',
    fontSize: 13,
    fontWeight: '600',
  },

  saveButton: {
    height: 52,
    backgroundColor: '#7A9E7E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  cancelButton: {
    alignItems: 'center',
    padding: 15,
  },

  cancelText: {
    color: '#7B827C',
    fontSize: 14,
    fontWeight: '600',
  },
});