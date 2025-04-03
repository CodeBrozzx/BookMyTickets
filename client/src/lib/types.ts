export enum SeatType {
  GOLD = 'GOLD',
  RED = 'RED',
  BLUE = 'BLUE'
}

export interface Movie {
  id: number;
  title: string;
  genre: string;
  durationMins: number;
  posterUrl: string;
}

export interface ShowTime {
  id: number;
  movieId: number;
  time: string;
  date: string;
}

export interface Seat {
  id: number;
  name: string;
  type: SeatType;
  booked: boolean;
  showTimeId: number;
}

export interface Booking {
  id: string;
  movieId: number;
  showTimeId: number;
  seats: number[];
  totalAmount: number;
  bookingDate: string;
  userId?: number;
}

export interface BookingData {
  movieId: number;
  showTimeId: number;
  seats: number[];
  totalAmount: number;
  bookingDate: string;
  userId?: number;
}
