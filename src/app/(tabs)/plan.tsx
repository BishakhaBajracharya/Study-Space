import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

type Session = {
  id: string;
  subject?: string;
  topic?: string;
  date?: string;
  time?: string;
  duration?: number;
  completed?: boolean;
};

export default function Plan() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'sessions'));

      const data: Session[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Session[];

      setSessions(data);
    } catch (error) {
      console.log('Plan error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const toggleComplete = async (session: Session) => {
    try {
      const newStatus = !session.completed;

      await updateDoc(doc(db, 'sessions', session.id), {
        completed: newStatus,
      });

      setSessions((current) =>
        current.map((item) =>
          item.id === session.id
            ? { ...item, completed: newStatus }
            : item
        )
      );
    } catch (error) {
      console.log('Completion error:', error);
      Alert.alert('Error', 'Could not update the session.');
    }
  };

  const deleteSession = (id: string) => {
    Alert.alert(
      'Delete session',
      'Are you sure you want to delete this study session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'sessions', id));
              loadSessions();
            } catch (error) {
              console.log('Delete session error:', error);
            }
          },
        },
      ]
    );
  };

  const completedCount = sessions.filter(
    (session) => session.completed
  ).length;

  return (
    <View style={styles.container}>
      {/* Top spacing */}
      <View style={styles.topSpace} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Study Plan</Text>

          <Text style={styles.subtitle}>
            {sessions.length} planned session
            {sessions.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-session' as any)}
        >
          <Ionicons name="add" size={27} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Summary */}
      {sessions.length > 0 && (
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>YOUR PLAN</Text>

            <Text style={styles.summaryNumber}>
              {completedCount}/{sessions.length}
            </Text>

            <Text style={styles.summaryText}>
              sessions completed
            </Text>
          </View>

          <View style={styles.summaryCircle}>
            <Ionicons
              name="checkmark"
              size={25}
              color="#7A9E7E"
            />
          </View>
        </View>
      )}

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          sessions.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={30}
                color="#7A9E7E"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Your plan is empty
            </Text>

            <Text style={styles.emptyText}>
              Add a study session and start planning your day.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() =>
                router.push('/add-session' as any)
              }
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />

              <Text style={styles.emptyButtonText}>
                Add Session
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.completed && styles.completedCard,
            ]}
          >
            <Pressable
              style={[
                styles.checkButton,
                item.completed &&
                  styles.checkButtonCompleted,
              ]}
              onPress={() => toggleComplete(item)}
            >
              {item.completed && (
                <Ionicons
                  name="checkmark"
                  size={17}
                  color="#FFFFFF"
                />
              )}
            </Pressable>

            <View style={styles.info}>
              <Text
                style={[
                  styles.subject,
                  item.completed &&
                    styles.completedText,
                ]}
              >
                {item.subject || 'Study Session'}
              </Text>

              <Text
                style={[
                  styles.topic,
                  item.completed &&
                    styles.completedText,
                ]}
              >
                {item.topic || 'No topic added'}
              </Text>

              <View style={styles.details}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color="#8A918B"
                />

                <Text style={styles.detailText}>
                  {item.date || 'No date'}
                </Text>

                {item.time ? (
                  <>
                    <Text style={styles.dot}>•</Text>

                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="#8A918B"
                    />

                    <Text style={styles.detailText}>
                      {item.time}
                    </Text>
                  </>
                ) : null}

                <Text style={styles.dot}>•</Text>

                <Text style={styles.detailText}>
                  {item.duration || 0} min
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => deleteSession(item.id)}
            >
              <Ionicons
                name="trash-outline"
                size={19}
                color="#A77A7A"
              />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F2',
    paddingHorizontal: 24,
  },

  topSpace: {
    height: 50,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#26332A',
  },

  subtitle: {
    fontSize: 13,
    color: '#7B827C',
    marginTop: 4,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7A9E7E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryCard: {
    backgroundColor: '#E8F0E5',
    borderRadius: 19,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6C806E',
  },

  summaryNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 3,
  },

  summaryText: {
    fontSize: 12,
    color: '#68736A',
    marginTop: 1,
  },

  summaryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAF8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  completedCard: {
    backgroundColor: '#F1F4F0',
  },

  checkButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#AAB5AB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkButtonCompleted: {
    backgroundColor: '#7A9E7E',
    borderColor: '#7A9E7E',
  },

  info: {
    flex: 1,
    marginLeft: 13,
  },

  subject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332A',
  },

  topic: {
    fontSize: 13,
    color: '#707871',
    marginTop: 3,
  },

  completedText: {
    color: '#8B938D',
    textDecorationLine: 'line-through',
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  detailText: {
    fontSize: 11,
    color: '#8A918B',
    marginLeft: 4,
  },

  dot: {
    color: '#B0B5B0',
    marginHorizontal: 7,
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7EEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  empty: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26332A',
  },

  emptyText: {
    fontSize: 13,
    color: '#7B827C',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },

  emptyButton: {
    backgroundColor: '#7A9E7E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});