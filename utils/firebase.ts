import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyvudPpybkbBD6v91QkoO4shaNAyGspDI",
  authDomain: "trading-paradise-analytics.firebaseapp.com",
  projectId: "trading-paradise-analytics",
  storageBucket: "trading-paradise-analytics.firebasestorage.app",
  messagingSenderId: "1028781080880",
  appId: "1:1028781080880:web:bdc31136b75bbf71b248f5",
  measurementId: "G-JQNRSJ2HEB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
