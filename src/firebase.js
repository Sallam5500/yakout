// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// البيانات اللي أخدتها من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrBfsvWfVtfby8fUk2fixYniaZkpt-tyY",
  authDomain: "yakout-factory-system.firebaseapp.com",
  projectId: "yakout-factory-system",
  storageBucket: "yakout-factory-system.firebasestorage.app",
  messagingSenderId: "877745344979",
  appId: "1:877745344979:web:65910df7478a02f57adf26",
  measurementId: "G-LBY3Y4JLFF"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// إنشاء الاتصال بقاعدة البيانات
const db = getFirestore(app);

// نصدر قاعدة البيانات
export { db };
