import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface PeriodSelectorProps {
  value: number;
  onChange: (period: number, startDate?: Date, endDate?: Date) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);

  const periods = [
    { label: "7 dias", value: 7 },
    { label: "30 dias", value: 30 },
    { label: "90 dias", value: 90 },
  ];

  const handlePeriodChange = (period: number) => {
    setIsCustom(false);
    onChange(period);
  };

  const handleCustomRange = () => {
    if (customRange?.from && customRange?.to) {
      const days = Math.ceil((customRange.to.getTime() - customRange.from.getTime()) / (1000 * 60 * 60 * 24));
      onChange(days, customRange.from, customRange.to);
      setIsCustom(true);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value && !isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => handlePeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {isCustom && customRange?.from && customRange?.to
              ? `${format(customRange.from, "dd/MM")} - ${format(customRange.to, "dd/MM")}`
              : "Personalizado"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={customRange}
            onSelect={setCustomRange}
            numberOfMonths={2}
          />
          <div className="p-3 border-t">
            <Button
              onClick={handleCustomRange}
              disabled={!customRange?.from || !customRange?.to}
              className="w-full"
              size="sm"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
