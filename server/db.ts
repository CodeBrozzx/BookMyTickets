import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

const { Client } = pg;

// Create PostgreSQL client
export const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with the client
export const db = drizzle(client, { schema });

// Function to initialize the database connection
export async function initDb() {
  try {
    await client.connect();
    console.log("Database connection established");
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return false;
  }
}