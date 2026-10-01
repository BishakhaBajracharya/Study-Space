import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA1c1a6QbTnAF2bTXlxBekyPfhtgPdojsI',
  authDomain: 'study-planner-0.firebaseapp.com',
  projectId: 'study-planner-0',
  storageBucket: 'study-planner-0.firebasestorage.app',
  messagingSenderId: '585827617292',
  appId: '1:585827617292:web:44347f1d94834a68c63c29',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});