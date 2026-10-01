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
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

type Subject = {
  id: string;
  name?: string;
  code?: string;
};

type Session = {
  subject?: string;
  completed?: boolean;
};

type SubjectStats = {
  sessions: number;
  completed: number;
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessionStats, setSessionStats] = useState<{
    [key: string]: SubjectStats;
  }>({});

  const loadSubjects = async () => {
    try {
      const subjectSnapshot = await getDocs(
        collection(db, 'subjects')
      );

      const sessionSnapshot = await getDocs(
        collection(db, 'sessions')
      );

      const subjectData: Subject[] = subjectSnapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      ) as Subject[];

      const stats: { [key: string]: SubjectStats } = {};

      sessionSnapshot.docs.forEach((item) => {
        const data = item.data();
        const subjectName = data.subject || 'Other';

        if (!stats[subjectName]) {
          stats[subjectName] = {
            sessions: 0,
            completed: 0,
          };
        }

        stats[subjectName].sessions += 1;

        if (data.completed === true) {
          stats[subjectName].completed += 1;
        }
      });

      setSubjects(subjectData);
      setSessionStats(stats);
    } catch (error) {
      console.log('Subject error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubjects();
    }, [])
  );

  const deleteSubject = (id: string) => {
    Alert.alert(
      'Delete subject',
      'Are you sure you want to delete this subject?',
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
              await deleteDoc(doc(db, 'subjects', id));
              loadSubjects();
            } catch (error) {
              console.log('Delete subject error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Subjects</Text>

          <Text style={styles.subtitle}>
            {subjects.length} subject
            {subjects.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-subject' as any)}
        >
          <Ionicons name="add" size={27} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          subjects.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="book-outline"
                size={30}
                color="#7A9E7E"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No subjects yet
            </Text>

            <Text style={styles.emptyText}>
              Add your subjects to organize your study plan.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() =>
                router.push('/add-subject' as any)
              }
            >
              <Ionicons name="add" size={19} color="#FFFFFF" />

              <Text style={styles.emptyButtonText}>
                Add Subject
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const stats = sessionStats[item.name || ''] || {
            sessions: 0,
            completed: 0,
          };

          const percentage =
            stats.sessions === 0
              ? 0
              : Math.round(
                  (stats.completed / stats.sessions) * 100
                );

          return (
            <View style={styles.card}>
              {/* Icon */}
              <View style={styles.icon}>
                <Ionicons
                  name="book"
                  size={23}
                  color="#7A9E7E"
                />
              </View>

              {/* Subject info */}
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.name || 'Unnamed Subject'}
                </Text>

                <Text style={styles.code}>
                  {item.code || 'No subject code'}
                </Text>

                {stats.sessions > 0 ? (
                  <>
                    <Text style={styles.activity}>
                      {stats.sessions} session
                      {stats.sessions !== 1 ? 's' : ''} ·{' '}
                      {stats.completed} completed
                    </Text>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${percentage}%` },
                        ]}
                      />
                    </View>
                  </>
                ) : (
                  <Text style={styles.activity}>
                    No study sessions yet
                  </Text>
                )}
              </View>

              {/* Delete */}
              <Pressable
                style={styles.deleteButton}
                onPress={() => deleteSubject(item.id)}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#A77A7A"
                />
              </Pressable>
            </View>
          );
        }}
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
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

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  icon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 13,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332A',
  },

  code: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 3,
  },

  activity: {
    fontSize: 11,
    color: '#7A9E7E',
    marginTop: 7,
  },

  progressTrack: {
    height: 5,
    backgroundColor: '#E8F0E5',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 7,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7A9E7E',
    borderRadius: 10,
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