import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import BookingProgress from "@/components/BookingProgress";
import SeatMap from "@/components/SeatMap";
import Ticket from "@/components/Ticket";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Movie, ShowTime, Seat, SeatType, BookingData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function BookingSteps() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/booking/:movieId");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Booking state
  const [currentStep, setCurrentStep] = useState(2); // Start at step 2 (time selection)
  const [selectedTime, setSelectedTime] = useState<ShowTime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [numPeople, setNumPeople] = useState<number>(1);
  
  // Fetch movie data
  const { data: movie, isLoading: isLoadingMovie } = useQuery<Movie>({
    queryKey: ['/api/movies', params?.movieId],
    enabled: !!params?.movieId
  });
  
  // Fetch showtimes
  const { data: showTimes, isLoading: isLoadingShowTimes } = useQuery<ShowTime[]>({
    queryKey: ['/api/showtimes', params?.movieId],
    enabled: !!params?.movieId
  });
  
  // Fetch seats for a specific showtime
  const { data: availableSeats, isLoading: isLoadingSeats } = useQuery<Seat[]>({
    queryKey: ['/api/seats', selectedTime?.id],
    enabled: !!selectedTime?.id,
  });
  
  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      console.log('Creating booking with data:', bookingData);
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      const result = await response.json();
      console.log('Booking created:', result);
      return result;
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ['/api/seats', selectedTime?.id] });
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.toString(),
        variant: "destructive"
      });
    }
  });
  
  // Price calculation
  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const price = 
        seat.type === SeatType.GOLD ? 400 : 
        seat.type === SeatType.RED ? 250 : 
        seat.type === SeatType.BLUE ? 150 : 0;
      return total + price;
    }, 0);
  };
  
  const handleTimeSelect = (time: ShowTime) => {
    setSelectedTime(time);
    setSelectedSeats([]);
    setCurrentStep(3);
  };
  
  const handleSeatToggle = (seat: Seat) => {
    if (seat.booked) return;
    
    // Check if seat is already selected
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      // Check if we've reached the maximum number of people
      if (selectedSeats.length < numPeople) {
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        // If trying to select more seats than allowed, show a toast notification
        toast({
          title: "Seat selection limit reached",
          description: `You can only select ${numPeople} seat${numPeople > 1 ? 's' : ''} for this booking.`,
          variant: "destructive"
        });
      }
    }
  };
  
  const handleConfirmSeats = () => {
    if (selectedSeats.length === 0) return;
    
    bookingMutation.mutate({
      movieId: parseInt(params?.movieId || "0"),
      showTimeId: selectedTime?.id || 0,
      seats: selectedSeats.map(seat => seat.id),
      totalAmount: calculateTotal(),
      bookingDate: new Date(),
      userId: user?.id // Add the user ID if authenticated
    });
  };
  
  const resetBooking = () => {
    setCurrentStep(1);
    setSelectedTime(null);
    setSelectedSeats([]);
    setBookingId(null);
    setLocation("/");
  };

  // Go back to movie selection
  const goBackToMovies = () => {
    setCurrentStep(1);
    setLocation("/");
  };

  // Go back to time selection
  const goBackToTimes = () => {
    setCurrentStep(2);
    setSelectedTime(null);
    setSelectedSeats([]);
  };
  
  if (isLoadingMovie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
        <p>The movie you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/")} className="mt-4">Back to Movies</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BookingProgress currentStep={currentStep} />
      
      <div className="mt-8">
        {/* Step 1: Movie Selection - handled in Home.tsx */}
        
        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-heading">{movie.title}</h2>
                <p className="text-muted-foreground">Select showtime at SCREEN 1</p>
              </div>
              <Button variant="link" className="text-primary" onClick={goBackToMovies}>
                &larr; Change Movie
              </Button>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-heading font-semibold mb-4">
                Today - {format(new Date(), 'MMMM d, yyyy')}
              </h3>
              
              {/* Number of people selector */}
              <div className="mb-6">
                <h4 className="text-md font-heading font-semibold mb-2">
                  Number of people:
                </h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      variant={numPeople === num ? "default" : "outline"}
                      className="w-12 h-12"
                      onClick={() => setNumPeople(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll need to select {numPeople} seat{numPeople > 1 ? 's' : ''} in the next step
                </p>
              </div>
              
              <h4 className="text-md font-heading font-semibold mb-2">
                Select a showtime:
              </h4>
              
              {isLoadingShowTimes ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {showTimes?.map((time) => (
                    <Button
                      key={time.id}
                      variant="outline"
                      className={cn(
                        "p-3 h-auto text-center",
                        selectedTime?.id === time.id && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time.time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Step 3: Seat Selection */}
        {currentStep === 3 && selectedTime && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold font-heading">
                  {movie.title} - {selectedTime.time}
                </h2>
                <p className="text-muted-foreground">
                  SCREEN 1 • {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
              <Button variant="link" className="text-primary" onClick={goBackToTimes}>
                &larr; Change Time
              </Button>
            </div>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex justify-center items-center mb-12">
                  <div className="w-3/4 h-10 bg-accent rounded-lg flex items-center justify-center text-muted-foreground">
                    SCREEN
                  </div>
                </div>
                
                {isLoadingSeats ? (
                  <div className="space-y-8">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <SeatMap 
                    seats={availableSeats || []} 
                    selectedSeats={selectedSeats}
                    onSeatToggle={handleSeatToggle}
                  />
                )}
                
                <div className="bg-card p-4 rounded-lg mt-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-semibold text-lg">
                        Selected Seats: {selectedSeats.length > 0 
                          ? selectedSeats.map(s => s.name).join(', ') 
                          : 'None'} ({selectedSeats.length}/{numPeople})
                      </h4>
                      <p className="text-muted-foreground">
                        {Object.entries(
                          selectedSeats.reduce((acc, seat) => {
                            const type = seat.type;
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                          .map(([type, count]) => `${count} ${type}`)
                          .join(', ')}
                      </p>
                      {selectedSeats.length < numPeople && (
                        <p className="text-sm text-amber-500 mt-1">
                          Please select {numPeople - selectedSeats.length} more seat{numPeople - selectedSeats.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-lg">
                        Total: ₹{calculateTotal()}
                      </h4>
                      <p className="text-sm text-muted-foreground text-right">
                        {numPeople} {numPeople === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                disabled={selectedSeats.length !== numPeople || bookingMutation.isPending}
                onClick={handleConfirmSeats}
              >
                {bookingMutation.isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        )}
        
        {/* Step 4: Ticket Confirmation */}
        {currentStep === 4 && movie && selectedTime && bookingId && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground">Your movie tickets have been booked successfully.</p>
            </div>
            
            <Ticket 
              movie={movie}
              showTime={selectedTime}
              seats={selectedSeats}
              bookingId={bookingId}
              totalAmount={calculateTotal()}
            />
            
            <div className="mt-8 flex justify-center">
              <Button onClick={resetBooking}>Book Another Movie</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
