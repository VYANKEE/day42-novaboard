// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// PASTE YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyCAGZg6vFfHurLU_XF1ehogiZ8_HolG0ME",
  authDomain: "day42-communityheplboard.firebaseapp.com",
  projectId: "day42-communityheplboard",
  storageBucket: "day42-communityheplboard.firebasestorage.app",
  messagingSenderId: "809986815129",
  appId: "1:809986815129:web:485580edcd3bd56c0bf408"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the tools we need
export const db = getFirestore(app);
export const auth = getAuth(app);

// Automatically sign in the user anonymously when the app loads
signInAnonymously(auth).then(() => {
    console.log("Signed in anonymously");
}).catch((error) => {
    console.error("Error signing in", error);
});