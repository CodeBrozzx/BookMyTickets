import { cn } from '@/lib/utils';
import { Showtime } from '@/lib/types';

interface TimeSlotProps {
  showtime: Showtime;
  isSelected: boolean;
  onSelect: (showtime: Showtime) => void;
}

export function TimeSlot({ showtime, isSelected, onSelect }: TimeSlotProps) {
  return (
    <div 
      className={cn(
        "p-3 rounded-md text-center cursor-pointer transition-colors",
        isSelected ? "bg-primary text-white" : "bg-gray-900 hover:bg-gray-800"
      )}
      onClick={() => onSelect(showtime)}
    >
      <span className="block">{showtime.startTime}</span>
    </div>
  );
}
