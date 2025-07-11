import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA7dW4v06iMIC2-6_Pib6iSSY7ZDUlE87w",
  authDomain: "cashly-b9377.firebaseapp.com",
  projectId: "cashly-b9377",
  storageBucket: "cashly-b9377.firebasestorage.app",
  messagingSenderId: "701634111459",
  appId: "1:701634111459:web:a588a50b2229338596e2d6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
