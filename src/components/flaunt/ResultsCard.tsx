import { forwardRef } from "react";
import { motion } from "motion/react";
import { ScoreBars } from "./ScoreBars";
import { verdictTone } from "../../lib/flaunt-utils";
import type { Analysis } from "../../lib/flaunt-types";
import { cn } from "../../lib/utils";

interface ResultsCardProps {
  analysis: Analysis;
  preview: string;
  occasionLabel: string;
  occasionEmoji: string;
}

export const ResultsCard = forwardRef<HTMLDivElement, ResultsCardProps>(
  ({ analysis, preview, occasionLabel, occasionEmoji }, ref) => {
    const tone = verdictTone(analysis.is_it_a_yes);

    return (
      <div ref={ref} className="space-y-5">
        {/* Main Verdict Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Large Score Display */}
          <div className="absolute top-0 right-0 z-10 flex flex-col items-end">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display italic text-[80px] md:text-[100px] leading-none tracking-tighter text-gradient-brand"
            >
              {analysis.scores.overall}
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground -mt-1">
              Stylist Verdict
            </span>
          </div>

          {/* Main Card */}
          <div className="glass-card rounded-[32px] p-6 md:p-8 pt-16 md:pt-20 space-y-6 overflow-hidden relative">
            <div className="absolute top-0 left-6 w-1 h-24 bg-gradient-to-b from-brand-pink/40 to-transparent" />

            {/* Verdict Header */}
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                tone.bg
              )}>
                <span className="text-2xl">{tone.emoji}</span>
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight leading-none italic">
                  {tone.label}
                </h2>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
                  <span className="mr-1">{occasionEmoji}</span> {occasionLabel}
                </p>
              </div>
            </div>

            {/* Vibe Check */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <p className="text-xs uppercase tracking-widest text-brand-pink mb-2 font-semibold">
                Vibe Check
              </p>
              <p className="font-display text-xl md:text-2xl text-foreground leading-snug italic">
                "{analysis.vibe_check}"
              </p>
            </motion.div>

            {/* The Good & The Fix */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-5"
              >
                <p className="text-xs uppercase tracking-widest text-score-good mb-2 font-semibold">
                  The Good
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {analysis.the_good}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-5"
              >
                <p className="text-xs uppercase tracking-widest text-brand-orange mb-2 font-semibold">
                  The Fix
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {analysis.the_fix}
                </p>
              </motion.div>
            </div>

            {/* Score Bars */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-baseline justify-between mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                  Scorecard
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  words matter more than numbers
                </p>
              </div>
              <ScoreBars scores={analysis.scores} />
            </motion.div>

            {/* Items Spotted */}
            {analysis.items_spotted?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2 pt-2 border-t border-white/5"
              >
                {analysis.items_spotted.map((item, i) => (
                  <span
                    key={`${item}-${i}`}
                    className="px-3 py-1.5 rounded-full text-xs bg-gradient-brand-soft border border-white/10 text-foreground/90"
                  >
                    {item}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Final Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-strong rounded-2xl p-5"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">
                — Signing Off
              </p>
              <p className="font-display italic text-lg text-foreground/95 leading-relaxed">
                {analysis.final_note}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }
);

ResultsCard.displayName = "ResultsCard";
