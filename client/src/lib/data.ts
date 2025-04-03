// This file contains initial data for in-memory storage

import { Movie, ShowTime, Seat, SeatType } from "./types";

// Movie Data
export const initialMovies: Movie[] = [
  {
    id: 1,
    title: "Avengers: Endgame",
    genre: "Action, Adventure",
    durationMins: 180,
    posterUrl: "https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Dune",
    genre: "Sci-Fi, Adventure",
    durationMins: 155,
    posterUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Black Widow",
    genre: "Action, Thriller",
    durationMins: 134,
    posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "No Time to Die",
    genre: "Action, Adventure",
    durationMins: 163,
    posterUrl: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

// Showtimes Data (calculated based on movie duration)
export const initialShowTimes: ShowTime[] = [
  // Avengers: Endgame (180 mins + 10 mins buffer)
  { id: 1, movieId: 1, time: "10:00 AM", date: "2023-07-20" },
  { id: 2, movieId: 1, time: "1:10 PM", date: "2023-07-20" },
  { id: 3, movieId: 1, time: "4:20 PM", date: "2023-07-20" },
  { id: 4, movieId: 1, time: "7:30 PM", date: "2023-07-20" },
  { id: 5, movieId: 1, time: "10:40 PM", date: "2023-07-20" },
  
  // Dune (155 mins + 10 mins buffer)
  { id: 6, movieId: 2, time: "9:00 AM", date: "2023-07-20" },
  { id: 7, movieId: 2, time: "11:45 AM", date: "2023-07-20" },
  { id: 8, movieId: 2, time: "2:30 PM", date: "2023-07-20" },
  { id: 9, movieId: 2, time: "5:15 PM", date: "2023-07-20" },
  { id: 10, movieId: 2, time: "8:00 PM", date: "2023-07-20" },
  { id: 11, movieId: 2, time: "10:45 PM", date: "2023-07-20" },
  
  // Black Widow (134 mins + 10 mins buffer)
  { id: 12, movieId: 3, time: "9:30 AM", date: "2023-07-20" },
  { id: 13, movieId: 3, time: "12:00 PM", date: "2023-07-20" },
  { id: 14, movieId: 3, time: "2:30 PM", date: "2023-07-20" },
  { id: 15, movieId: 3, time: "5:00 PM", date: "2023-07-20" },
  { id: 16, movieId: 3, time: "7:30 PM", date: "2023-07-20" },
  { id: 17, movieId: 3, time: "10:00 PM", date: "2023-07-20" },
  
  // No Time to Die (163 mins + 10 mins buffer)
  { id: 18, movieId: 4, time: "9:00 AM", date: "2023-07-20" },
  { id: 19, movieId: 4, time: "11:55 AM", date: "2023-07-20" },
  { id: 20, movieId: 4, time: "2:50 PM", date: "2023-07-20" },
  { id: 21, movieId: 4, time: "5:45 PM", date: "2023-07-20" },
  { id: 22, movieId: 4, time: "8:40 PM", date: "2023-07-20" },
  { id: 23, movieId: 4, time: "11:35 PM", date: "2023-07-20" }
];

// Generate seats for each showtime
export function generateSeats(showTimeId: number): Seat[] {
  const seats: Seat[] = [];
  let seatId = (showTimeId - 1) * 64 + 1; // Unique seat IDs for each showtime
  
  // Gold seats (8 seats)
  for (let i = 1; i <= 8; i++) {
    seats.push({
      id: seatId++,
      name: `G${i}`,
      type: SeatType.GOLD,
      booked: [5, 6].includes(i), // Seats G5 and G6 are already booked
      showTimeId
    });
  }
  
  // Red seats (20 seats)
  for (let i = 1; i <= 20; i++) {
    seats.push({
      id: seatId++,
      name: `R${i}`,
      type: SeatType.RED,
      booked: [4, 5, 16, 17].includes(i), // Seats R4, R5, R16, R17 are already booked
      showTimeId
    });
  }
  
  // Blue seats (36 seats)
  for (let i = 1; i <= 36; i++) {
    seats.push({
      id: seatId++,
      name: `B${i}`,
      type: SeatType.BLUE,
      booked: [5, 6, 7, 8, 18, 19].includes(i), // Seats B5, B6, B7, B8, B18, B19 are already booked
      showTimeId
    });
  }
  
  return seats;
}
