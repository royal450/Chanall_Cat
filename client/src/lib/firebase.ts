import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuioOF7DCq-qIoa1D6ZyZbrAVeGjbfv3Y",
  authDomain: "daily-campaign-king.firebaseapp.com",
  databaseURL: "https://daily-campaign-king-default-rtdb.firebaseio.com/",
  projectId: "daily-campaign-king",
  storageBucket: "daily-campaign-king.firebasestorage.app",
  messagingSenderId: "1089692268059",
  appId: "1:1089692268059:web:eddde94901436202576abe",
  measurementId: "G-6PXV3B5322"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
