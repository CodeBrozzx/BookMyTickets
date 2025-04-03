import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

// Safe database client manager
class DatabaseManager {
  private client: pg.Client | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private connected: boolean = false;
  private errorHandlersAttached: boolean = false;
  
  constructor() {
    // Create initial client but don't connect yet
    this.createClient();
  }
  
  private createClient(): pg.Client {
    this.client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });
    return this.client;
  }
  
  public getClient(): pg.Client | null {
    return this.client;
  }
  
  public getDb(): ReturnType<typeof drizzle> | null {
    return this.db;
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  private attachErrorHandlers() {
    if (this.errorHandlersAttached || !this.client) return;
    
    this.client.on('error', async (err: any) => {
      // Mark error as handled to prevent crash
      err.handled = true;
      
      console.error('Database connection error:', err);
      this.connected = false;
      
      // Reconnect on next operation
      try {
        console.log('Attempting automatic reconnection...');
        await this.reconnect();
      } catch (reconnectErr) {
        console.error('Auto reconnection failed:', reconnectErr);
      }
    });
    
    this.errorHandlersAttached = true;
  }
  
  public async connect(): Promise<boolean> {
    try {
      if (!this.client) {
        this.createClient();
      }
      
      if (!this.client) {
        console.error('Failed to create client');
        return false;
      }
      
      await this.client.connect();
      this.db = drizzle(this.client, { schema });
      this.connected = true;
      this.attachErrorHandlers();
      console.log('Database connection established');
      return true;
    } catch (err) {
      console.error('Database connection failed:', err);
      this.connected = false;
      return false;
    }
  }
  
  public async reconnect(): Promise<boolean> {
    try {
      // Close existing connection if it exists
      if (this.client) {
        try {
          this.connected = false;
          await this.client.end().catch(() => {});
        } catch (err) {
          // Ignore end errors
        }
      }
      
      // Create new connection
      this.createClient();
      return await this.connect();
    } catch (err) {
      console.error('Database reconnection failed:', err);
      this.connected = false;
      return false;
    }
  }
  
  public async safeOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      // Try the operation
      return await operation();
    } catch (err: any) {
      // Log the error
      console.error('Database operation failed:', err);
      
      // Determine if it's a connection error
      const isConnectionError = 
        err.code === '57P01' || 
        err.code === '08006' || 
        (err.message && (
          err.message.includes('connection') || 
          err.message.includes('terminating')
        ));
      
      // Try to reconnect for connection errors
      if (isConnectionError) {
        try {
          await this.reconnect();
        } catch (reconnectErr) {
          console.error('Reconnection failed:', reconnectErr);
        }
      }
      
      // Return fallback value
      return fallback;
    }
  }
  
  public async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.client.end();
      } catch (err) {
        console.error('Error shutting down database connection:', err);
      }
    }
    this.client = null;
    this.db = null;
    this.connected = false;
  }
}

// Create the database manager
const dbManager = new DatabaseManager();

// Export a safe db instance
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    const manager = dbManager.getDb();
    if (!manager) {
      throw new Error('Database not connected');
    }
    return manager[prop as keyof typeof manager];
  }
});

// Export functions
export async function initDb(): Promise<boolean> {
  return await dbManager.connect();
}

export async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  return await dbManager.safeOperation(operation, fallback);
}