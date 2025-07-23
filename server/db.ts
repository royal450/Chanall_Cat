// PostgreSQL configuration (optional, only for legacy features)
let pool = null;
let db = null;

async function initializeDatabase() {
  try {
    if (process.env.DATABASE_URL) {
      const { Pool, neonConfig } = await import('@neondatabase/serverless');
      const { drizzle } = await import('drizzle-orm/neon-serverless');
      const ws = await import("ws");
      const schema = await import("@shared/schema");

      neonConfig.webSocketConstructor = ws.default;
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema });
    }
  } catch (error) {
    console.log('PostgreSQL not configured, using Firebase only');
  }
}

// Initialize database on module load
initializeDatabase();

export { pool, db };

// Firebase configuration (primary database)
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