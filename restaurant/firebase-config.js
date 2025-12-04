// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// SECURITY: API keys should be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB5krGSrH9mO408AoaEzDAfWi4-FZk6Yes",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "frontend-web-e454c.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "frontend-web-e454c",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "frontend-web-e454c.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "477577416048",
  appId: process.env.FIREBASE_APP_ID || "1:477577416048:web:a9acef3ba4e0058f9fd3b5",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-PVHD7MMLSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
