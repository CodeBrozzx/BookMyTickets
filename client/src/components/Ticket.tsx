import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Movie, ShowTime, Seat } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";

interface TicketProps {
  movie: Movie;
  showTime: ShowTime;
  seats: Seat[];
  bookingId: string;
  totalAmount: number;
}

export default function Ticket({ 
  movie, 
  showTime, 
  seats, 
  bookingId, 
  totalAmount 
}: TicketProps) {
  return (
    <Card className="overflow-hidden">
      {/* Ticket header */}
      <div className="bg-primary p-4 text-white text-center">
        <h3 className="font-heading font-bold text-xl">MovieTix</h3>
      </div>
      
      {/* Ticket body */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Ticket details */}
          <div className="flex-1">
            <h3 className="font-heading font-bold text-xl mb-4">{movie.title}</h3>
            
            <div className="space-y-3">
              <div className="flex">
                <div className="w-24 text-muted-foreground">Date:</div>
                <div>{format(new Date(), 'MMMM d, yyyy')}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">Time:</div>
                <div>{showTime.time}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">Screen:</div>
                <div>SCREEN 1</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">Seats:</div>
                <div>{seats.map(seat => seat.name).join(', ')}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">People:</div>
                <div>{seats.length} {seats.length === 1 ? 'person' : 'people'}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">Amount:</div>
                <div>₹{totalAmount}</div>
              </div>
              <div className="flex">
                <div className="w-24 text-muted-foreground">Booking ID:</div>
                <div>{bookingId}</div>
              </div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="flex-none flex flex-col items-center justify-center">
            <div className="bg-white p-2 rounded-lg mb-2">
              <QRCodeSVG value="Successful" size={128} />
            </div>
            <span className="text-xs text-muted-foreground">Scan for entry</span>
          </div>
        </div>
      </div>
      
      {/* Ticket footer */}
      <div className="p-4 text-sm text-muted-foreground text-center">
        <p>Please arrive 15 minutes before showtime. This ticket is non-refundable.</p>
      </div>
    </Card>
  );
}
