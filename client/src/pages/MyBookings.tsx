import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Booking, Movie, ShowTime, Seat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Film, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MyBookings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isLoadingUser } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !user) {
      setLocation('/auth');
    }
  }, [user, isLoadingUser, setLocation]);
  
  // Fetch user's bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ['/api/my-bookings'],
    enabled: !!user,
  });
  
  // Fetch movies for booking details
  const { data: movies } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    enabled: !!bookings,
  });
  
  // Fetch showtimes for booking details
  const { data: showtimes } = useQuery<ShowTime[]>({
    queryKey: ['/api/showtimes'],
    enabled: !!bookings,
  });
  
  if (isLoadingUser || isLoadingBookings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              You haven't made any bookings yet. Start by exploring movies and booking tickets.
            </p>
            <Button onClick={() => setLocation('/')}>Browse Movies</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Find movie and showtime details for each booking
  const bookingsWithDetails = bookings.map(booking => {
    const movie = movies?.find(m => m.id === booking.movieId);
    const showtime = showtimes?.find(s => s.id === booking.showTimeId);
    
    return {
      ...booking,
      movie,
      showtime
    };
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      
      <div className="space-y-6">
        {bookingsWithDetails.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <div className="border-b border-border p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Movie poster and title */}
                <div className="flex-none">
                  {booking.movie?.posterUrl && (
                    <div className="w-36 h-52 rounded-md overflow-hidden">
                      <img 
                        src={booking.movie.posterUrl} 
                        alt={booking.movie?.title || 'Movie poster'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                {/* Booking details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {booking.movie?.title || 'Loading movie details...'}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.showtime ? 
                          new Date(booking.showtime.date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 
                          'Loading date...'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.showtime?.time || 'Loading time...'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>SCREEN 1</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Seats:</span>
                      <span>{booking.seats?.length || 0} seats</span>
                    </div>
                  </div>
                </div>
                
                {/* Booking date and actions */}
                <div className="flex-none text-right">
                  <div className="text-sm text-muted-foreground mb-2">
                    Booked {formatDistanceToNow(new Date(booking.bookingDate), { addSuffix: true })}
                  </div>
                  <div className="text-lg font-semibold mb-4">₹{booking.totalAmount}</div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation(`/booking/${booking.id}/details`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}