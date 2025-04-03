export function SeatLegend() {
  return (
    <div className="flex justify-center space-x-6 mb-4 text-sm">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-700 rounded mr-2"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-primary rounded mr-2"></div>
        <span>Selected</span>
      </div>
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-600 rounded mr-2"></div>
        <span>Booked</span>
      </div>
    </div>
  );
}
