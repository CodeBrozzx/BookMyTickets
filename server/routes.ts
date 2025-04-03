import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBookingId } from "../client/src/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all movies
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movies", error });
    }
  });

  // Get a single movie by ID
  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const movie = await storage.getMovie(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movie", error });
    }
  });

  // Get all showtimes
  app.get("/api/showtimes", async (req, res) => {
    try {
      const showtimes = await storage.getAllShowtimes();
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showtimes", error });
    }
  });

  // Get showtimes for a specific movie
  app.get("/api/showtimes/:movieId", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const showtimes = await storage.getShowtimesByMovie(movieId);
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch showtimes", error });
    }
  });

  // Get seats for a specific showtime
  app.get("/api/seats/:showtimeId", async (req, res) => {
    try {
      const showtimeId = parseInt(req.params.showtimeId);
      const seats = await storage.getSeatsByShowtime(showtimeId);
      res.json(seats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seats", error });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const { movieId, showTimeId, seats, totalAmount } = req.body;
      
      // Basic validation
      if (!movieId || !showTimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: "Invalid booking data" });
      }
      
      // Check if any of the selected seats are already booked
      const existingSeats = await storage.getSeatsByShowtime(showTimeId);
      const bookedSeats = existingSeats.filter(seat => 
        seats.includes(seat.id) && seat.booked
      );
      
      if (bookedSeats.length > 0) {
        return res.status(400).json({
          message: "Some selected seats are already booked",
          seats: bookedSeats.map(s => s.name)
        });
      }
      
      // Generate a unique booking ID
      const bookingId = generateBookingId();
      
      // Create the booking
      const booking = await storage.createBooking({
        id: bookingId,
        movieId,
        showTimeId,
        seats,
        totalAmount,
        bookingDate: new Date()
      });
      
      // Mark the seats as booked
      await Promise.all(seats.map(seatId => 
        storage.updateSeatBookingStatus(seatId, true)
      ));
      
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to create booking", error });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
