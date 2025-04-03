import { 
  Movie, InsertMovie, 
  Showtime, InsertShowtime, 
  Seat, InsertSeat,
  Booking, InsertBooking,
  User, InsertUser 
} from "@shared/schema";
import { initialMovies, initialShowTimes, generateSeats } from "../client/src/lib/data";

// Storage interface
export interface IStorage {
  // Movies
  getAllMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Showtimes
  getAllShowtimes(): Promise<Showtime[]>;
  getShowtime(id: number): Promise<Showtime | undefined>;
  getShowtimesByMovie(movieId: number): Promise<Showtime[]>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  
  // Seats
  getSeat(id: number): Promise<Seat | undefined>;
  getSeatsByShowtime(showtimeId: number): Promise<Seat[]>;
  createSeat(seat: InsertSeat): Promise<Seat>;
  updateSeatBookingStatus(id: number, booked: boolean): Promise<Seat | undefined>;
  
  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private movies: Map<number, Movie>;
  private showtimes: Map<number, Showtime>;
  private seats: Map<number, Seat>;
  private bookings: Map<string, Booking>;
  private users: Map<number, User>;
  
  private movieIdCounter: number;
  private showtimeIdCounter: number;
  private seatIdCounter: number;
  private userIdCounter: number;
  
  constructor() {
    this.movies = new Map();
    this.showtimes = new Map();
    this.seats = new Map();
    this.bookings = new Map();
    this.users = new Map();
    
    this.movieIdCounter = 1;
    this.showtimeIdCounter = 1;
    this.seatIdCounter = 1;
    this.userIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }
  
  private initializeData() {
    // Add movies
    initialMovies.forEach(movie => {
      this.movies.set(movie.id, movie);
      if (movie.id >= this.movieIdCounter) {
        this.movieIdCounter = movie.id + 1;
      }
    });
    
    // Add showtimes
    initialShowTimes.forEach(showtime => {
      this.showtimes.set(showtime.id, showtime);
      if (showtime.id >= this.showtimeIdCounter) {
        this.showtimeIdCounter = showtime.id + 1;
      }
    });
    
    // Generate seats for each showtime
    initialShowTimes.forEach(showtime => {
      const seats = generateSeats(showtime.id);
      seats.forEach(seat => {
        this.seats.set(seat.id, seat);
        if (seat.id >= this.seatIdCounter) {
          this.seatIdCounter = seat.id + 1;
        }
      });
    });
  }
  
  // Movies
  async getAllMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }
  
  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }
  
  async createMovie(movie: InsertMovie): Promise<Movie> {
    const id = this.movieIdCounter++;
    const newMovie = { ...movie, id };
    this.movies.set(id, newMovie);
    return newMovie;
  }
  
  // Showtimes
  async getAllShowtimes(): Promise<Showtime[]> {
    return Array.from(this.showtimes.values());
  }
  
  async getShowtime(id: number): Promise<Showtime | undefined> {
    return this.showtimes.get(id);
  }
  
  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    return Array.from(this.showtimes.values())
      .filter(showtime => showtime.movieId === movieId);
  }
  
  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    const id = this.showtimeIdCounter++;
    const newShowtime = { ...showtime, id };
    this.showtimes.set(id, newShowtime);
    return newShowtime;
  }
  
  // Seats
  async getSeat(id: number): Promise<Seat | undefined> {
    return this.seats.get(id);
  }
  
  async getSeatsByShowtime(showtimeId: number): Promise<Seat[]> {
    return Array.from(this.seats.values())
      .filter(seat => seat.showTimeId === showtimeId);
  }
  
  async createSeat(seat: InsertSeat): Promise<Seat> {
    const id = this.seatIdCounter++;
    const newSeat = { ...seat, id };
    this.seats.set(id, newSeat);
    return newSeat;
  }
  
  async updateSeatBookingStatus(id: number, booked: boolean): Promise<Seat | undefined> {
    const seat = this.seats.get(id);
    if (!seat) return undefined;
    
    const updatedSeat = { ...seat, booked };
    this.seats.set(id, updatedSeat);
    return updatedSeat;
  }
  
  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    this.bookings.set(booking.id, booking as Booking);
    return booking as Booking;
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values())
      .find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
}

export const storage = new MemStorage();
