import { motion } from "motion/react";
import { SCORE_LABELS, type Scores } from "../../lib/flaunt-types";
import { cn } from "../../lib/utils";

interface ScoreBarsProps {
  scores: Scores;
}

export function ScoreBars({ scores }: ScoreBarsProps) {
  const entries: Array<keyof Scores> = ["overall", "occasion_match", "color_game", "fit_silhouette", "style_points"];

  return (
    <div className="space-y-4">
      {entries.map((key, index) => {
        const score = scores[key];
        const label = SCORE_LABELS[key];
        const colorClass = score >= 8 ? "bg-emerald-400" : score >= 5 ? "bg-amber-400" : "bg-rose-400";
        const textClass = score >= 8 ? "text-emerald-400" : score >= 5 ? "text-amber-400" : "text-rose-400";

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className="space-y-1.5"
          >
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
              <span className={cn("font-mono", textClass)}>{score.toFixed(1)}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score * 10}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + 0.1 * index,
                  ease: [0.32, 0.72, 0, 1]
                }}
                className={cn("h-full rounded-full", colorClass)}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
