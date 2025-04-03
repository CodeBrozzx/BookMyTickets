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
    
    // Handle connection errors
    this.client.on('error', async (err: any) => {
      try {
        // Mark error as handled to prevent crash
        err.handled = true;
        
        console.error('Database connection error:', err);
        this.connected = false;
        
        // Reconnect on next operation
        console.log('Attempting automatic reconnection...');
        await this.reconnect();
      } catch (reconnectErr) {
        console.error('Auto reconnection failed:', reconnectErr);
      }
    });
    
    // Handle connection ends
    this.client.on('end', async () => {
      try {
        console.log('Database connection ended, attempting to reconnect...');
        this.connected = false;
        await this.reconnect();
      } catch (reconnectErr) {
        console.error('Reconnection after end failed:', reconnectErr);
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
      // Mark as disconnected first
      this.connected = false;
      this.errorHandlersAttached = false;
      
      // Close existing connection if it exists
      if (this.client) {
        try {
          // Set a timeout to avoid hanging
          const timeout = setTimeout(() => {
            console.log('Client end operation timed out, forcing reconnect');
            this.client = null;
          }, 1000);
          
          await this.client.end().catch(() => {});
          clearTimeout(timeout);
        } catch (err) {
          // Ignore end errors
          console.log('Ignoring client end error during reconnect');
        }
      }
      
      // Reset client and create new connection
      this.client = null;
      this.db = null;
      this.createClient();
      
      // Connect with the new client
      return await this.connect();
    } catch (err) {
      console.error('Database reconnection failed:', err);
      this.connected = false;
      // Make sure to clean up
      this.client = null;
      this.db = null;
      // Create a fresh client for next attempt
      this.createClient();
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
    
    // Handle missing connection by returning a proxy that auto-reconnects
    if (!manager) {
      // For methods, return a function that attempts reconnection before operation
      if (typeof prop === 'string' && ['select', 'insert', 'update', 'delete', 'query'].includes(prop)) {
        return async (...args: any[]) => {
          console.log(`Attempting to reconnect before database operation: ${String(prop)}`);
          const reconnected = await dbManager.reconnect();
          
          if (reconnected) {
            const newManager = dbManager.getDb();
            if (newManager) {
              const method = newManager[prop as keyof typeof newManager];
              if (typeof method === 'function') {
                return (method as Function).apply(newManager, args);
              }
            }
          }
          
          console.error(`Cannot perform database operation: ${String(prop)}, connection failed`);
          // Return empty results rather than crashing
          return [];
        };
      }
      
      // For non-methods, try to gracefully handle
      console.error(`Database not connected when accessing: ${String(prop)}`);
      return undefined;
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