import { create } from 'zustand';
import { Movie, Showtime, SelectedSeat, Step } from '@/lib/types';

interface BookingState {
  currentStep: Step;
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedSeats: SelectedSeat[];
  bookingId: string | null;
  
  setCurrentStep: (step: Step) => void;
  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedShowtime: (showtime: Showtime | null) => void;
  addSelectedSeat: (seat: SelectedSeat) => void;
  removeSelectedSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  setBookingId: (id: string) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  selectedMovie: null,
  selectedShowtime: null,
  selectedSeats: [],
  bookingId: null,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSelectedMovie: (movie) => set({ 
    selectedMovie: movie,
    // When changing movie, reset showtime and seats
    selectedShowtime: null,
    selectedSeats: []
  }),
  
  setSelectedShowtime: (showtime) => set({ 
    selectedShowtime: showtime,
    // When changing showtime, reset seats
    selectedSeats: []
  }),
  
  addSelectedSeat: (seat) => set(state => ({
    selectedSeats: [...state.selectedSeats, seat]
  })),
  
  removeSelectedSeat: (seatId) => set(state => ({
    selectedSeats: state.selectedSeats.filter(seat => seat.id !== seatId)
  })),
  
  clearSelectedSeats: () => set({ selectedSeats: [] }),
  
  setBookingId: (id) => set({ bookingId: id }),
  
  clearBooking: () => set({
    currentStep: 1,
    selectedMovie: null,
    selectedShowtime: null,
    selectedSeats: [],
    bookingId: null
  })
}));
