import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { OCCASIONS, type OccasionId } from "../../lib/flaunt-types";

interface OccasionPickerProps {
  value: OccasionId | null;
  onChange: (id: OccasionId) => void;
  disabled?: boolean;
}

export function OccasionPicker({ value, onChange, disabled }: OccasionPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          Where are you going?
        </span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OCCASIONS.map((occ, idx) => (
          <motion.button
            key={occ.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onChange(occ.id)}
            disabled={disabled}
            className={cn(
              "group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
              value === occ.id
                ? "glass-card border-white/20 shadow-glow"
                : "border border-transparent opacity-60 hover:opacity-100 hover:bg-white/5",
              disabled && "cursor-not-allowed"
            )}
          >
            <span className={cn(
              "text-xl mb-1.5 transition-all duration-300",
              value === occ.id ? "scale-110" : "grayscale group-hover:grayscale-0"
            )}>
              {occ.emoji}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {occ.label}
            </span>
            {value === occ.id && (
              <motion.div
                layoutId="occasion-glow"
                className="absolute inset-0 bg-gradient-brand opacity-[0.05]"
                transition={{ type: "spring", bounce: 0.2 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
