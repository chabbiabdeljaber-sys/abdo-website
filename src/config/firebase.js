// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH86cQ-W2W501W3-tmUB_EVSDv7wYA_54",
  authDomain: "ecommerce-d019e.firebaseapp.com",
  projectId: "ecommerce-d019e",
  storageBucket: "ecommerce-d019e.firebasestorage.app",
  messagingSenderId: "113989765309",
  appId: "1:113989765309:web:76626ad365d8321222cfd4",
  measurementId: "G-Q5DF262DZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export const auth = getAuth(app);
export { db };

