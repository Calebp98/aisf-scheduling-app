import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAGIVC59GKbLoMrHx99u43HCLqwyLKJMQ",
  authDomain: "aisf-chat-cd424.firebaseapp.com",
  projectId: "aisf-chat-cd424",
  storageBucket: "aisf-chat-cd424.firebasestorage.app",
  messagingSenderId: "251201370106",
  appId: "1:251201370106:web:ad32bc8c626bbeb8bed643"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;