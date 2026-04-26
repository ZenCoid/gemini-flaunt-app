import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
    >
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-full glass-card flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-brand-pink/50" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-pink/20 blur-xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
      <div className="space-y-2">
        <h3 className="font-display italic text-xl text-muted-foreground">
          Awaiting your fit.
        </h3>
        <p className="text-sm text-muted-foreground/60 max-w-xs">
          Upload a photo and pick where you're going to get started.
        </p>
      </div>
    </motion.div>
  );
}

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8"
    >
      <div className="relative">
        <motion.div
          className="w-28 h-28 rounded-full border-2 border-white/5 border-t-brand-pink"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ borderTopWidth: "3px" }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-brand-sparkle" />
        </motion.div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display italic text-3xl text-shadow-glow">
          Consulting the oracle.
        </h3>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">
          Scanning silhouette & color profile
        </p>
      </div>
    </motion.div>
  );
}
