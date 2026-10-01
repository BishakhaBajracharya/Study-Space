import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../../firebaseConfig';

type Session = {
  id: string;
  subject?: string;
  topic?: string;
  date?: string;
  time?: string;
  duration?: number;
  completed?: boolean;
};

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'sessions'));

      const data: Session[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Session[];

      setSessions(data);
    } catch (error) {
      console.log('Dashboard error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login' as any);
    } catch (error) {
      console.log('Logout error:', error);
      Alert.alert('Error', 'Could not log out.');
    }
  };

  const today = new Date();

const todayString =
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const todaySessions = sessions.filter(
    (session) => session.date === todayString
  );

  const todayMinutes = todaySessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0
  );

  const completedSessions = sessions.filter(
    (session) => session.completed === true
  );

  const completedMinutes = completedSessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0
  );

  const totalMinutes = sessions.reduce(
    (total, session) => total + Number(session.duration || 0),
    0
  );

  const completionPercentage =
    sessions.length === 0
      ? 0
      : Math.round(
          (completedSessions.length / sessions.length) * 100
        );

  // Find the next incomplete session.
  const incompleteSessions = sessions.filter(
    (session) => !session.completed
  );

  const nextSession =
    incompleteSessions.length > 0
      ? [...incompleteSessions].sort((a, b) => {
          const dateA = `${a.date || ''} ${a.time || ''}`;
          const dateB = `${b.date || ''} ${b.time || ''}`;

          return dateA.localeCompare(dateB);
        })[0]
      : null;

  const completedHours = Math.floor(completedMinutes / 60);
  const completedRemainingMinutes = completedMinutes % 60;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>WELCOME</Text>
          <Text style={styles.title}>Ready to study?</Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="person-outline"
            size={21}
            color="#7A9E7E"
          />
        </Pressable>
      </View>

      {/* Today's Study */}
      <View style={styles.todayCard}>
        <View style={styles.todayTop}>
          <View>
            <Text style={styles.todayLabel}>
              TODAY'S STUDY
            </Text>

            <Text style={styles.todayNumber}>
              {todaySessions.length}
              <Text style={styles.todayNumberSmall}>
                {' '}
                session
                {todaySessions.length !== 1 ? 's' : ''}
              </Text>
            </Text>

            <Text style={styles.todaySubtext}>
              {Math.floor(todayMinutes / 60)}h{' '}
              {todayMinutes % 60}m planned
            </Text>
          </View>

          <View style={styles.todayIcon}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color="#7A9E7E"
            />
          </View>
        </View>

        <Pressable
          style={styles.viewPlanButton}
          onPress={() => router.push('/plan' as any)}
        >
          <Text style={styles.viewPlanText}>
            View today's plan
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#7A9E7E"
          />
        </Pressable>
      </View>

      {/* Next Session */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Next session
        </Text>
      </View>

      {nextSession ? (
        <Pressable
          style={styles.sessionCard}
          onPress={() => router.push('/plan' as any)}
        >
          <View style={styles.sessionIcon}>
            <Ionicons
              name="book-outline"
              size={23}
              color="#7A9E7E"
            />
          </View>

          <View style={styles.sessionInfo}>
            <Text style={styles.sessionSubject}>
              {nextSession.subject || 'Study Session'}
            </Text>

            <Text style={styles.sessionTopic}>
              {nextSession.topic || 'No topic added'}
            </Text>

            <View style={styles.sessionDetails}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#8A918B"
              />

              <Text style={styles.sessionDetailText}>
                {nextSession.date || 'No date'}
              </Text>

              {nextSession.time ? (
                <>
                  <Text style={styles.dot}>•</Text>

                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#8A918B"
                  />

                  <Text style={styles.sessionDetailText}>
                    {nextSession.time}
                  </Text>
                </>
              ) : null}

              <Text style={styles.dot}>•</Text>

              <Text style={styles.sessionDetailText}>
                {nextSession.duration || 0} min
              </Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#A5ADA6"
          />
        </Pressable>
      ) : sessions.length > 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="checkmark-circle-outline"
              size={25}
              color="#7A9E7E"
            />
          </View>

          <View style={styles.emptyInfo}>
            <Text style={styles.emptyTitle}>
              All sessions completed 🎉
            </Text>

            <Text style={styles.emptyText}>
              Nice work! Your planned sessions are done.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#7A9E7E"
            />
          </View>

          <View style={styles.emptyInfo}>
            <Text style={styles.emptyTitle}>
              No study sessions yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first session to start planning.
            </Text>
          </View>

          <Pressable
            style={styles.smallAddButton}
            onPress={() =>
              router.push('/add-session' as any)
            }
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* Study Progress */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Your progress
        </Text>

        <Pressable
          onPress={() => router.push('/progress' as any)}
        >
          <Text style={styles.viewText}>View all</Text>
        </Pressable>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressTop}>
          <View>
            <Text style={styles.progressNumber}>
              {completionPercentage}%
            </Text>

            <Text style={styles.progressLabel}>
              sessions completed
            </Text>
          </View>

          <View style={styles.progressIcon}>
            <Ionicons
              name="trending-up-outline"
              size={25}
              color="#7A9E7E"
            />
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${completionPercentage}%`,
              },
            ]}
          />
        </View>

        <View style={styles.progressBottom}>
          <Text style={styles.progressSmallText}>
            {completedSessions.length} of {sessions.length}{' '}
            sessions
          </Text>

          <Text style={styles.progressSmallText}>
            {completedHours}h {completedRemainingMinutes}m done
          </Text>
        </View>
      </View>


      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={18}
          color="#9B6B6B"
        />

        <Text style={styles.logoutText}>
          Log out
        </Text>
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
    paddingBottom: 45,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 35,
  },

  greeting: {
    fontSize: 29,
    fontWeight: '700',
    color: '#000000',
  },

  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    marginTop: 5,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  todayCard: {
    backgroundColor: '#E8F0E5',
    borderRadius: 22,
    padding: 20,
  },

  todayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  todayLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#6C806E',
  },

  todayNumber: {
    fontSize: 29,
    fontWeight: '700',
    color: '#26332A',
    marginTop: 7,
  },

  todayNumberSmall: {
    fontSize: 17,
    fontWeight: '500',
  },

  todaySubtext: {
    fontSize: 13,
    color: '#68736A',
    marginTop: 2,
  },

  todayIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FAF8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  viewPlanButton: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#D4E1D1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewPlanText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#58745C',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 27,
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#26332A',
  },

  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A9E7E',
  },

  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },

  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sessionInfo: {
    flex: 1,
    marginLeft: 13,
  },

  sessionSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#26332A',
  },

  sessionTopic: {
    fontSize: 13,
    color: '#707871',
    marginTop: 3,
  },

  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  sessionDetailText: {
    fontSize: 10,
    color: '#8A918B',
    marginLeft: 4,
  },

  dot: {
    color: '#B0B5B0',
    marginHorizontal: 5,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyInfo: {
    flex: 1,
    marginLeft: 13,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#26332A',
  },

  emptyText: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 3,
  },

  smallAddButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7A9E7E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    elevation: 1,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressNumber: {
    fontSize: 27,
    fontWeight: '700',
    color: '#26332A',
  },

  progressLabel: {
    fontSize: 12,
    color: '#7B827C',
    marginTop: 3,
  },

  progressIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#E8F0E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressTrack: {
    height: 7,
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

  progressBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  progressSmallText: {
    fontSize: 11,
    color: '#8A918B',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    padding: 10,
  },

  logoutText: {
    color: '#9B6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});