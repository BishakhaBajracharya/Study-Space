import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

type Session = {
  id: string;
  subject?: string;
  duration?: number;
  completed?: boolean;
};

export default function Progress() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadProgress = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'sessions'));

      const data: Session[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Session[];

      setSessions(data);
    } catch (error) {
      console.log('Progress error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const totalMinutes = sessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0
  );

  const completedSessions = sessions.filter(
    (session) => session.completed
  );

  const completedMinutes = completedSessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0
  );

  const completedCount = completedSessions.length;
  const totalCount = sessions.length;

  const completionPercentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const completedHours = Math.floor(completedMinutes / 60);
  const completedRemainingMinutes = completedMinutes % 60;

  const subjectStats: {
    [key: string]: {
      sessions: number;
      completed: number;
    };
  } = {};

  sessions.forEach((session) => {
    const subject = session.subject || 'Other';

    if (!subjectStats[subject]) {
      subjectStats[subject] = {
        sessions: 0,
        completed: 0,
      };
    }

    subjectStats[subject].sessions += 1;

    if (session.completed) {
      subjectStats[subject].completed += 1;
    }
  });

  const subjects = Object.entries(subjectStats);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Progress</Text>

      <Text style={styles.subtitle}>
        See how your study is going
      </Text>

      {/* Total Study Time */}
      <View style={styles.mainCard}>
        <View style={styles.mainIcon}>
          <Ionicons
            name="time-outline"
            size={25}
            color="#7A9E7E"
          />
        </View>

        <Text style={styles.mainNumber}>
          {hours}h {minutes}m
        </Text>

        <Text style={styles.mainLabel}>
          Total planned study time
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={23}
              color="#7A9E7E"
            />
          </View>

          <Text style={styles.statNumber}>
            {completedCount}
          </Text>

          <Text style={styles.statLabel}>
            Completed
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color="#7A9E7E"
            />
          </View>

          <Text style={styles.statNumber}>
            {totalCount}
          </Text>

          <Text style={styles.statLabel}>
            Planned
          </Text>
        </View>
      </View>

      {/* Completion */}
      <Text style={styles.sectionTitle}>
        Completion
      </Text>

      <View style={styles.completionCard}>
        <View style={styles.completionTop}>
          <View>
            <Text style={styles.completionNumber}>
              {completionPercentage}%
            </Text>

            <Text style={styles.completionText}>
              of your planned sessions completed
            </Text>
          </View>

          <Ionicons
            name="trending-up-outline"
            size={28}
            color="#7A9E7E"
          />
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionPercentage}%` },
            ]}
          />
        </View>
      </View>

      {/* Completed Study Time */}
      <Text style={styles.sectionTitle}>
        Completed study time
      </Text>

      <View style={styles.completedTimeCard}>
        <Ionicons
          name="checkmark-done-outline"
          size={25}
          color="#7A9E7E"
        />

        <View style={styles.completedTimeInfo}>
          <Text style={styles.completedTimeNumber}>
            {completedHours}h {completedRemainingMinutes}m
          </Text>

          <Text style={styles.completedTimeText}>
            Study time you've completed
          </Text>
        </View>
      </View>

      {/* Subject Activity */}
      {subjects.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Subject activity
          </Text>

          <View style={styles.subjectCard}>
            {subjects.map(([subject, stats], index) => (
              <View
                key={subject}
                style={[
                  styles.subjectRow,
                  index !== subjects.length - 1 &&
                    styles.subjectBorder,
                ]}
              >
                <View style={styles.subjectIcon}>
                  <Ionicons
                    name="book-outline"
                    size={19}
                    color="#7A9E7E"
                  />
                </View>

                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>
                    {subject}
                  </Text>

                  <Text style={styles.subjectProgress}>
                    {stats.completed}/{stats.sessions} completed
                  </Text>
                </View>

                <Text style={styles.subjectPercentage}>
                  {stats.sessions === 0
                    ? 0
                    : Math.round(
                        (stats.completed / stats.sessions) * 100
                      )}
                  %
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      {sessions.length === 0 && (
        <View style={styles.emptyCard}>
          <Ionicons
            name="bar-chart-outline"
            size={30}
            color="#7A9E7E"
          />

          <Text style={styles.emptyTitle}>
            No progress yet
          </Text>

          <Text style={styles.emptyText}>
            Add study sessions and complete them to see
            your progress here.
          </Text>
        </View>
      )}
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
    paddingBottom: 45,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 20,
  },

  subtitle: {
    fontSize: 14,
    color: '#7B827C',
    marginTop: 5,
    marginBottom: 22,
  },

  mainCard: {
    backgroundColor: '#E8F0E5',
    borderRadius: 21,
    padding: 15,
  },

  mainIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#FAF8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainNumber: {
    fontSize: 30,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 14,
  },

  mainLabel: {
    fontSize: 13,
    color: '#68736A',
    marginTop: 3,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    elevation: 1,
  },

  statIcon: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 10,
  },

  statLabel: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 27,
    marginBottom: 11,
  },

  completionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    elevation: 1,
  },

  completionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  completionNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#26332A',
  },

  completionText: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 3,
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#E8F0E5',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 17,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7A9E7E',
    borderRadius: 10,
  },

  completedTimeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  completedTimeInfo: {
    marginLeft: 13,
  },

  completedTimeNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#26332A',
  },

  completedTimeText: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 3,
  },

  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    elevation: 1,
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  subjectBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1ED',
  },

  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  subjectInfo: {
    flex: 1,
    marginLeft: 12,
  },

  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26332A',
  },

  subjectProgress: {
    fontSize: 11,
    color: '#7B827C',
    marginTop: 3,
  },

  subjectPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A9E7E',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginTop: 27,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 12,
  },

  emptyText: {
    fontSize: 13,
    color: '#7B827C',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 5,
  },
});