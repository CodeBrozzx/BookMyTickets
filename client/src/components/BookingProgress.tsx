import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
}

export default function BookingProgress({ currentStep }: BookingProgressProps) {
  const steps = [
    { number: 1, label: "Select Movie" },
    { number: 2, label: "Choose Time" },
    { number: 3, label: "Select Seats" },
    { number: 4, label: "Confirmation" },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -z-10"></div>
        
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10",
                currentStep === step.number && "bg-primary",
                currentStep > step.number && "bg-green-500", 
                currentStep < step.number && "bg-muted"
              )}
            >
              <span>{step.number}</span>
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
