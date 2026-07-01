import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
export const auth = getAuth();

export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  score: number;
  survivedTime: number;
  timestamp: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  const entries: LeaderboardEntry[] = [];
  querySnapshot.forEach((doc) => {
    entries.push({ id: doc.id, ...doc.data() } as LeaderboardEntry);
  });
  return entries;
}

export async function addLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>) {
  try {
    await addDoc(collection(db, 'leaderboard'), {
      ...entry,
      timestamp: Date.now()
    });
  } catch (error) {
     console.error("Error adding document: ", error);
  }
}
