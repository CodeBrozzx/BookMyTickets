import { IStorage } from './storage';
import { MemStorage } from './storage';
import { PgStorage } from './pgStorage';
import { Booking, InsertBooking, InsertMovie, InsertSeat, InsertShowtime, InsertUser, Movie, Seat, Showtime, User } from '@shared/schema';
import { log } from './vite';
import session from 'express-session';

/**
 * HybridStorage - Uses Postgres database when available, falls back to in-memory storage
 * when database connection issues occur to ensure the application remains functional.
 */
export class HybridStorage implements IStorage {
  private pgStorage: PgStorage;
  private memStorage: MemStorage;
  private useDatabase: boolean = true;
  private readonly sessionStore: session.Store;
  
  constructor() {
    try {
      // Initialize both storage types
      this.pgStorage = new PgStorage();
      this.memStorage = new MemStorage();
      
      // Use the PG session store
      this.sessionStore = this.pgStorage.sessionStore;
      
      // Initialize memory storage with data from database if possible
      this.syncFromDatabaseToMemory().catch(err => {
        log(`Failed to sync initial data to memory: ${err}`, 'hybrid-storage');
      });
      
      log('Hybrid storage initialized with PostgreSQL and memory fallback', 'hybrid-storage');
    } catch (error) {
      log(`Error initializing hybrid storage: ${error}`, 'hybrid-storage');
      this.useDatabase = false;
      this.memStorage = new MemStorage();
      this.sessionStore = this.memStorage.sessionStore;
    }
  }
  
  /**
   * Synchronizes data from database to memory storage as a fallback
   */
  private async syncFromDatabaseToMemory(): Promise<void> {
    try {
      // Sync movies
      const movies = await this.pgStorage.getAllMovies();
      for (const movie of movies) {
        await this.memStorage.createMovie(movie);
      }
      
      // Sync showtimes
      const showtimes = await this.pgStorage.getAllShowtimes();
      for (const showtime of showtimes) {
        await this.memStorage.createShowtime(showtime);
      }
      
      // Sync seats
      for (const showtime of showtimes) {
        const seats = await this.pgStorage.getSeatsByShowtime(showtime.id);
        for (const seat of seats) {
          await this.memStorage.createSeat(seat);
        }
      }
      
      log('Successfully synced database data to in-memory storage', 'hybrid-storage');
    } catch (error) {
      log(`Error syncing data to memory: ${error}`, 'hybrid-storage');
      throw error;
    }
  }
  
  /**
   * Attempts a database operation, falls back to in-memory if DB operation fails
   */
  private async withFallback<T>(
    dbOperation: () => Promise<T>,
    memOperation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    if (this.useDatabase) {
      try {
        return await dbOperation();
      } catch (error) {
        log(`Database operation "${operationName}" failed, using memory fallback: ${error}`, 'hybrid-storage');
        this.useDatabase = false;
        
        // Try to sync data before falling back completely
        try {
          await this.syncFromDatabaseToMemory();
        } catch (syncError) {
          log(`Failed to sync data before fallback: ${syncError}`, 'hybrid-storage');
        }
      }
    }
    
    return await memOperation();
  }
  
  // Movies
  async getAllMovies(): Promise<Movie[]> {
    return this.withFallback(
      () => this.pgStorage.getAllMovies(),
      () => this.memStorage.getAllMovies(),
      'getAllMovies'
    );
  }
  
  async getMovie(id: number): Promise<Movie | undefined> {
    return this.withFallback(
      () => this.pgStorage.getMovie(id),
      () => this.memStorage.getMovie(id),
      `getMovie(${id})`
    );
  }
  
  async createMovie(movie: InsertMovie): Promise<Movie> {
    const newMovie = await this.withFallback(
      () => this.pgStorage.createMovie(movie),
      () => this.memStorage.createMovie(movie),
      'createMovie'
    );
    
    // If we successfully created in database but are in fallback mode, 
    // try to also create in memory for consistency
    if (!this.useDatabase) {
      try {
        await this.memStorage.createMovie(newMovie);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return newMovie;
  }
  
  // Showtimes
  async getAllShowtimes(): Promise<Showtime[]> {
    return this.withFallback(
      () => this.pgStorage.getAllShowtimes(),
      () => this.memStorage.getAllShowtimes(),
      'getAllShowtimes'
    );
  }
  
  async getShowtime(id: number): Promise<Showtime | undefined> {
    return this.withFallback(
      () => this.pgStorage.getShowtime(id),
      () => this.memStorage.getShowtime(id),
      `getShowtime(${id})`
    );
  }
  
  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    return this.withFallback(
      () => this.pgStorage.getShowtimesByMovie(movieId),
      () => this.memStorage.getShowtimesByMovie(movieId),
      `getShowtimesByMovie(${movieId})`
    );
  }
  
  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const newShowtime = await this.withFallback(
      () => this.pgStorage.createShowtime(showtime),
      () => this.memStorage.createShowtime(showtime),
      'createShowtime'
    );
    
    if (!this.useDatabase) {
      try {
        await this.memStorage.createShowtime(newShowtime);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return newShowtime;
  }
  
  // Seats
  async getSeat(id: number): Promise<Seat | undefined> {
    return this.withFallback(
      () => this.pgStorage.getSeat(id),
      () => this.memStorage.getSeat(id),
      `getSeat(${id})`
    );
  }
  
  async getSeatsByShowtime(showtimeId: number): Promise<Seat[]> {
    return this.withFallback(
      () => this.pgStorage.getSeatsByShowtime(showtimeId),
      () => this.memStorage.getSeatsByShowtime(showtimeId),
      `getSeatsByShowtime(${showtimeId})`
    );
  }
  
  async createSeat(seat: InsertSeat): Promise<Seat> {
    const newSeat = await this.withFallback(
      () => this.pgStorage.createSeat(seat),
      () => this.memStorage.createSeat(seat),
      'createSeat'
    );
    
    if (!this.useDatabase) {
      try {
        await this.memStorage.createSeat(newSeat);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return newSeat;
  }
  
  async updateSeatBookingStatus(id: number, booked: boolean): Promise<Seat | undefined> {
    const updatedSeat = await this.withFallback(
      () => this.pgStorage.updateSeatBookingStatus(id, booked),
      () => this.memStorage.updateSeatBookingStatus(id, booked),
      `updateSeatBookingStatus(${id}, ${booked})`
    );
    
    if (!this.useDatabase && updatedSeat) {
      try {
        await this.memStorage.updateSeatBookingStatus(id, booked);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return updatedSeat;
  }
  
  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.withFallback(
      () => this.pgStorage.getBooking(id),
      () => this.memStorage.getBooking(id),
      `getBooking(${id})`
    );
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return this.withFallback(
      () => this.pgStorage.getBookingsByUser(userId),
      () => this.memStorage.getBookingsByUser(userId),
      `getBookingsByUser(${userId})`
    );
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking = await this.withFallback(
      () => this.pgStorage.createBooking(booking),
      () => this.memStorage.createBooking(booking),
      'createBooking'
    );
    
    if (!this.useDatabase) {
      try {
        await this.memStorage.createBooking(newBooking);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return newBooking;
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.withFallback(
      () => this.pgStorage.getUser(id),
      () => this.memStorage.getUser(id),
      `getUser(${id})`
    );
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.withFallback(
      () => this.pgStorage.getUserByUsername(username),
      () => this.memStorage.getUserByUsername(username),
      `getUserByUsername(${username})`
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser = await this.withFallback(
      () => this.pgStorage.createUser(user),
      () => this.memStorage.createUser(user),
      'createUser'
    );
    
    if (!this.useDatabase) {
      try {
        await this.memStorage.createUser(newUser);
      } catch (error) {
        // Ignore errors in sync operation
      }
    }
    
    return newUser;
  }
  
  // Database initialization
  async initializeData(): Promise<void> {
    try {
      if (this.useDatabase) {
        await this.pgStorage.initializeData();
      }
      await this.memStorage.initializeData();
    } catch (error) {
      log(`Error initializing data: ${error}`, 'hybrid-storage');
      this.useDatabase = false;
      await this.memStorage.initializeData();
    }
  }
}