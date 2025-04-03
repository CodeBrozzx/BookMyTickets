import { and, eq } from 'drizzle-orm';
import { db, safeDbOperation } from './db';
import { 
  InsertMovie, Movie, InsertShowtime, Showtime, 
  InsertSeat, Seat, InsertBooking, Booking, InsertUser, User
} from '../shared/schema';
import { 
  movies, showtimes, seats, bookings, users 
} from '../shared/schema';
import { IStorage } from './storage';
import { generateSeats } from '../client/src/lib/data';

export class PgStorage implements IStorage {
  // Movies
  async getAllMovies(): Promise<Movie[]> {
    return await safeDbOperation(
      async () => await db.select().from(movies),
      []
    );
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(movies).where(eq(movies.id, id));
        return result[0];
      },
      undefined
    );
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    return await safeDbOperation(
      async () => {
        const result = await db.insert(movies).values(movie).returning();
        return result[0];
      },
      {} as Movie
    );
  }

  // Showtimes
  async getAllShowtimes(): Promise<Showtime[]> {
    return await safeDbOperation(
      async () => await db.select().from(showtimes),
      []
    );
  }

  async getShowtime(id: number): Promise<Showtime | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(showtimes).where(eq(showtimes.id, id));
        return result[0];
      },
      undefined
    );
  }

  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    return await safeDbOperation(
      async () => await db.select().from(showtimes).where(eq(showtimes.movieId, movieId)),
      []
    );
  }

  async createShowtime(showtime: InsertShowtime): Promise<Showtime> {
    return await safeDbOperation(
      async () => {
        const result = await db.insert(showtimes).values(showtime).returning();
        return result[0];
      },
      {} as Showtime
    );
  }

  // Seats
  async getSeat(id: number): Promise<Seat | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(seats).where(eq(seats.id, id));
        return result[0];
      },
      undefined
    );
  }

  async getSeatsByShowtime(showtimeId: number): Promise<Seat[]> {
    return await safeDbOperation(
      async () => await db.select().from(seats).where(eq(seats.showTimeId, showtimeId)),
      []
    );
  }

  async createSeat(seat: InsertSeat): Promise<Seat> {
    return await safeDbOperation(
      async () => {
        const result = await db.insert(seats).values(seat).returning();
        return result[0];
      },
      {} as Seat
    );
  }

  async updateSeatBookingStatus(id: number, booked: boolean): Promise<Seat | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.update(seats)
          .set({ booked })
          .where(eq(seats.id, id))
          .returning();
        return result[0];
      },
      undefined
    );
  }

  // Bookings
  async getBooking(id: string): Promise<Booking | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(bookings).where(eq(bookings.id, id));
        return result[0];
      },
      undefined
    );
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return await safeDbOperation(
      async () => await db.select().from(bookings).where(eq(bookings.userId, userId)),
      []
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    return await safeDbOperation(
      async () => {
        // Update seats to be booked
        for (const seatId of booking.seats) {
          await this.updateSeatBookingStatus(seatId, true);
        }
        
        // Need to ensure the seats field is an array for proper insertion
        const bookingData = {
          ...booking,
          seats: booking.seats as any // Cast to any to avoid type errors with array handling
        };
        
        const result = await db.insert(bookings).values(bookingData).returning();
        return result[0];
      },
      {} as Booking
    );
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      },
      undefined
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await safeDbOperation(
      async () => {
        const result = await db.select().from(users).where(eq(users.username, username));
        return result[0];
      },
      undefined
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    return await safeDbOperation(
      async () => {
        const result = await db.insert(users).values(user).returning();
        return result[0];
      },
      {} as User
    );
  }

  // Initialize data for the database
  async initializeData(): Promise<void> {
    // Check if we already have movies
    const existingMovies = await this.getAllMovies();
    if (existingMovies.length > 0) {
      console.log("Database already initialized");
      return;
    }

    // Movie data
    const movieData = [
      {
        title: "Avengers: Endgame",
        genre: "Action/Sci-Fi",
        durationMins: 181,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
      },
      {
        title: "The Lion King",
        genre: "Animation/Adventure",
        durationMins: 118,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NTI@._V1_.jpg"
      },
      {
        title: "Joker",
        genre: "Thriller/Drama",
        durationMins: 122,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWE0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg"
      },
      {
        title: "Parasite",
        genre: "Thriller/Drama",
        durationMins: 132,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg"
      },
      {
        title: "Spider-Man: No Way Home",
        genre: "Action/Adventure",
        durationMins: 148,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZWMyYzFjYTYtNTRjYi00OGExLWE2YzgtOGRmYjAxZTU3NzBiXkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg"
      },
      {
        title: "Dune",
        genre: "Sci-Fi/Adventure",
        durationMins: 155,
        posterUrl: "https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg"
      }
    ];

    // Insert movies
    for (const movie of movieData) {
      const newMovie = await this.createMovie(movie);
      
      // Create showtimes for each movie
      const times = ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM", "11:15 PM"];
      for (const time of times) {
        const showtime = await this.createShowtime({
          movieId: newMovie.id,
          time,
          date: new Date().toISOString().split('T')[0]
        });
        
        // Generate seats for each showtime
        const seatData = generateSeats(showtime.id);
        for (const seat of seatData) {
          await this.createSeat({
            name: seat.name,
            type: seat.type,
            booked: false,
            showTimeId: showtime.id
          });
        }
      }
    }
    
    console.log("Database initialized with sample data");
  }
}