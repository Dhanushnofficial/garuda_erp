import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4tkGGuQg8AWqUJrN7pNlI_1hFKhQgFew",
  authDomain: "garuda-a93af.firebaseapp.com",
  projectId: "garuda-a93af",
  storageBucket: "garuda-a93af.firebasestorage.app",
  messagingSenderId: "1095882168887",
  appId: "1:1095882168887:web:8d9998efc8faf959463db2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

