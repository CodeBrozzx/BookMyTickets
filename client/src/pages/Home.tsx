import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MovieCard from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Movie } from "@/lib/types";

export default function Home() {
  const { data: movies, isLoading } = useQuery<Movie[]>({ 
    queryKey: ['/api/movies']
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-heading mb-6">Now Showing</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array(8).fill(0).map((_, index) => (
            <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg h-[400px]">
              <Skeleton className="w-full h-64" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          ))
        ) : (
          movies?.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </div>
  );
}
