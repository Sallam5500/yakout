// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";   // ✅ إضافة الاستيراد

// بيانات مشروع Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrBfsvWfVtfby8fUk2fixYniaZkpt-tyY",
  authDomain: "yakout-factory-system.firebaseapp.com",
  projectId: "yakout-factory-system",
  // ✅ الدومين الصحيح للحفظ يكون appspot.com
  storageBucket: "yakout-factory-system.appspot.com",
  messagingSenderId: "877745344979",
  appId: "1:877745344979:web:65910df7478a02f57adf26",
  measurementId: "G-LBY3Y4JLFF",
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// إنشاء الاتصال بقاعدة البيانات والتخزين
export const db = getFirestore(app);
export const storage = getStorage(app);          // ✅ تصدير التخزين
