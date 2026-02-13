import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// TODO: Replace the following config with your own from the Firebase Console
// 1. Go to console.firebase.google.com
// 2. Create a new "Web" project
// 3. Copy the "firebaseConfig" object here
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyAejzNDWn2sNIN-0nBl903cPFMe2gTRBNs",
  authDomain: "study-timer-d3989.firebaseapp.com",
  projectId: "study-timer-d3989",
  storageBucket: "study-timer-d3989.firebasestorage.app",
  messagingSenderId: "977342920578",
  appId: "1:977342920578:web:a1b9c1dc96e2e7271cc19b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Authentication and Database
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Log to confirm init
console.log('Firebase Initialized:', app.name);
