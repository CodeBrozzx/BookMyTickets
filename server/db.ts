import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

const { Client } = pg;

// Create PostgreSQL client
export const client = new Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Initialize Drizzle with the client
export const db = drizzle(client, { schema });

// Function to initialize the database connection
export async function initDb() {
  try {
    await client.connect();
    console.log("Database connection established");
    
    // Set up error event listener to handle disconnections
    client.on('error', async (err: any) => {
      console.error('Database connection error:', err);
      
      // Create a new client if the connection is lost
      if (err.message.includes('terminating') || err.message.includes('connection') || 
          (err.code && (err.code === '57P01' || err.code === '08006'))) {
        console.log('Attempting to reconnect to the database...');
        
        try {
          // Create a new client instance
          const newClient = new Client({
            connectionString: process.env.DATABASE_URL,
            connectionTimeoutMillis: 5000,
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,
          });
          
          await newClient.connect();
          
          // Replace the existing client
          Object.assign(client, newClient);
          console.log('Successfully reconnected to the database');
        } catch (reconnectError) {
          console.error('Failed to reconnect to the database:', reconnectError);
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return false;
  }
}