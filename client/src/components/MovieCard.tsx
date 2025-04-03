import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [, setLocation] = useLocation();

  const handleBookNow = () => {
    setLocation(`/booking/${movie.id}`);
  };

  return (
    <Card className="overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
      <div className="w-full h-64 overflow-hidden">
        <img 
          src={movie.posterUrl} 
          alt={`${movie.title} Poster`} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-heading font-bold text-lg mb-2">{movie.title}</h3>
        <div className="flex justify-between text-sm text-muted-foreground mb-3">
          <span>{formatDuration(movie.durationMins)}</span>
          <span>{movie.genre}</span>
        </div>
        <Button 
          className="w-full" 
          onClick={handleBookNow}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}
