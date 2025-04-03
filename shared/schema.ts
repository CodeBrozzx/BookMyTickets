import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Movie Schema
export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  genre: text("genre").notNull(),
  durationMins: integer("duration_mins").notNull(),
  posterUrl: text("poster_url").notNull(),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

// Showtime Schema
export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  time: text("time").notNull(),
  date: text("date").notNull(),
});

export const insertShowtimeSchema = createInsertSchema(showtimes).omit({
  id: true,
});

// Seat Schema
export const seats = pgTable("seats", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // GOLD, RED, BLUE
  booked: boolean("booked").default(false),
  showTimeId: integer("showtime_id").notNull(),
});

export const insertSeatSchema = createInsertSchema(seats).omit({
  id: true,
});

// Booking Schema
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  showTimeId: integer("showtime_id").notNull(),
  seats: jsonb("seats").notNull().$type<number[]>(),
  totalAmount: integer("total_amount").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
  userId: integer("user_id"),
});

export const insertBookingSchema = createInsertSchema(bookings);

// Users Schema (for authentication, but we won't be implementing this fully)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;
export type Showtime = typeof showtimes.$inferSelect;

export type InsertSeat = z.infer<typeof insertSeatSchema>;
export type Seat = typeof seats.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
