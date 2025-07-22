import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

// Initialize Firebase for server
const app = initializeApp(firebaseConfig, 'server-app');
const database = getDatabase(app);

export { database };