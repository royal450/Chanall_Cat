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
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC-KFjdNMmVpAJOhR3FN8BK74KRNR_9EQ8",
  authDomain: "marketing-platform-1a4e6.firebaseapp.com",
  databaseURL: "https://marketing-platform-1a4e6-default-rtdb.firebaseio.com",
  projectId: "marketing-platform-1a4e6",
  storageBucket: "marketing-platform-1a4e6.firebasestorage.app",
  messagingSenderId: "502994030969",
  appId: "1:502994030969:web:3d2dc5dde1326a03e6cea8",
  measurementId: "G-HZBMHGL0PH"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
