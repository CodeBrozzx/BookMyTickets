import { useState } from "react";
import { Seat, SeatType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: Seat[];
  onSeatToggle: (seat: Seat) => void;
}

export default function SeatMap({ seats, selectedSeats, onSeatToggle }: SeatMapProps) {
  // Filter seats by type
  const goldSeats = seats.filter(seat => seat.type === SeatType.GOLD);
  const redSeats = seats.filter(seat => seat.type === SeatType.RED);
  const blueSeats = seats.filter(seat => seat.type === SeatType.BLUE);

  // Check if a seat is selected
  const isSeatSelected = (seatId: number) => {
    return selectedSeats.some(seat => seat.id === seatId);
  };

  return (
    <div className="seat-map max-w-4xl mx-auto mb-8">
      {/* Seat legend */}
      <div className="flex justify-center space-x-6 mb-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-accent rounded mr-2"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-primary rounded mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-muted-foreground rounded mr-2 opacity-50"></div>
          <span>Booked</span>
        </div>
      </div>
      
      {/* Gold Seats (Bed) */}
      <div className="mb-8">
        <h3 className="font-heading font-semibold mb-2 text-amber-400">GOLD - ₹400</h3>
        <div className="grid grid-cols-8 gap-2">
          {goldSeats.map(seat => (
            <div
              key={seat.id}
              className={cn(
                "seat h-16 rounded-lg flex items-center justify-center border cursor-pointer transition-all",
                seat.booked ? "bg-accent opacity-50 border-amber-400 cursor-not-allowed" : "border-amber-400",
                isSeatSelected(seat.id) ? "bg-primary border-amber-400" : seat.booked ? "bg-accent" : "bg-accent hover:bg-primary/20"
              )}
              onClick={() => onSeatToggle(seat)}
            >
              {seat.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* Red Seats (Chair 1) */}
      <div className="mb-8">
        <h3 className="font-heading font-semibold mb-2 text-red-500">RED - ₹250</h3>
        <div className="grid grid-cols-10 gap-2">
          {redSeats.map(seat => (
            <div
              key={seat.id}
              className={cn(
                "seat h-10 rounded flex items-center justify-center border cursor-pointer transition-all",
                seat.booked ? "bg-accent opacity-50 border-red-500 cursor-not-allowed" : "border-red-500",
                isSeatSelected(seat.id) ? "bg-primary border-red-500" : seat.booked ? "bg-accent" : "bg-accent hover:bg-primary/20"
              )}
              onClick={() => onSeatToggle(seat)}
            >
              {seat.name}
            </div>
          ))}
        </div>
      </div>
      
      {/* Blue Seats (Chair 2) */}
      <div>
        <h3 className="font-heading font-semibold mb-2 text-blue-500">BLUE - ₹150</h3>
        <div className="grid grid-cols-12 gap-2">
          {blueSeats.map(seat => (
            <div
              key={seat.id}
              className={cn(
                "seat h-8 rounded flex items-center justify-center border cursor-pointer transition-all",
                seat.booked ? "bg-accent opacity-50 border-blue-500 cursor-not-allowed" : "border-blue-500",
                isSeatSelected(seat.id) ? "bg-primary border-blue-500" : seat.booked ? "bg-accent" : "bg-accent hover:bg-primary/20"
              )}
              onClick={() => onSeatToggle(seat)}
            >
              {seat.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
