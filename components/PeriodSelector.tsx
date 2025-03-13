import { HistoricalPeriod } from "@/lib/districts";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface PeriodSelectorProps {
  periods: HistoricalPeriod[];
  selectedPeriod: HistoricalPeriod | null;
  onSelectPeriod: (period: HistoricalPeriod) => void;
}

export default function PeriodSelector({ periods, selectedPeriod, onSelectPeriod }: PeriodSelectorProps) {
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (selectedPeriod) {
      const index = periods.findIndex((p) => p.era === selectedPeriod.era);
      setSliderValue(index >= 0 ? index : 0);
    } else if (periods.length > 0) {
      setSliderValue(0);
      onSelectPeriod(periods[0]);
    }
  }, [selectedPeriod, periods, onSelectPeriod]);

  if (periods.length === 0) {
    return (
      <div className="py-4 px-6 rounded-xl bg-card/50 text-foreground/70 text-sm border border-glass-border">
        No temporal data available
      </div>
    );
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.target.value);
    setSliderValue(index);
    onSelectPeriod(periods[index]);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-thai text-foreground/70 flex items-center gap-2">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Slider
      </h2>
      <div className="relative px-4">
        <input
          type="range"
          min={0}
          max={periods.length - 1}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 bg-card rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--primary)]"
        />
        <div className="flex justify-between mt-2">
          {periods.map((period, index) => (
            <motion.span
              key={period.era}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: sliderValue === index ? 1 : 0.5, y: 0 }}
              className={`text-xs font-thai ${sliderValue === index ? "text-primary" : "text-foreground/70"}`}
            >
              {period.era}
            </motion.span>
          ))}
        </div>
      </div>
      {selectedPeriod && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-2 bg-card/50 rounded-lg border border-glass-border"
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedPeriod.color }} />
          <span className="text-sm font-thai text-foreground">{selectedPeriod.yearRange}</span>
        </motion.div>
      )}
    </div>
  );
}