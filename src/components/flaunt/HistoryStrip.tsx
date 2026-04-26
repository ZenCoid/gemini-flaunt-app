import { motion } from "motion/react";
import { History, Trash2 } from "lucide-react";
import type { HistoryEntry } from "../../lib/flaunt-types";

interface HistoryStripProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryStrip({ entries, onSelect, onClear }: HistoryStripProps) {
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 pt-6 border-t border-white/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <History className="w-4 h-4" />
          <span className="font-bold uppercase tracking-wider">Recent</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-brand-coral transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {entries.map((entry, i) => (
          <motion.button
            key={entry.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => onSelect(entry)}
            className="group relative flex-shrink-0 w-16 aspect-[10/16] rounded-2xl overflow-hidden glass-card"
          >
            <img
              src={entry.thumbnail}
              alt=""
              className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300"
            />
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[8px] font-bold uppercase tracking-wider text-brand-pink truncate">
                {entry.occasionLabel}
              </p>
              <p className="font-display text-sm font-bold">
                {entry.analysis.scores.overall}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
