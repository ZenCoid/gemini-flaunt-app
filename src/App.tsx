import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wand2, RefreshCw, Sparkles, Lock, Quote } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { FlauntLogo } from "./components/flaunt/FlauntLogo";
import { UploadDropzone } from "./components/flaunt/UploadDropzone";
import { OccasionPicker } from "./components/flaunt/OccasionPicker";
import { ResultsCard } from "./components/flaunt/ResultsCard";
import { EmptyState, LoadingState } from "./components/flaunt/States";
import { HistoryStrip } from "./components/flaunt/HistoryStrip";
import { 
  OCCASIONS, 
  type Analysis, 
  type OccasionId, 
  type HistoryEntry 
} from "./lib/flaunt-types";
import { 
  loadHistory, 
  saveHistoryEntry, 
  clearHistory, 
  processImage 
} from "./lib/flaunt-utils";

export default function App() {
  // Input state
  const [pending, setPending] = useState<{
    base64: string;
    mimeType: string;
    previewDataUrl: string;
    thumbnailDataUrl: string;
  } | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [vibeGoal, setVibeGoal] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [resultOccasion, setResultOccasion] = useState<OccasionId | null>(null);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const occasionMeta = OCCASIONS.find(o => o.id === (resultOccasion ?? occasion));
  const canAnalyze = !!pending && !!occasion && !loading;

  async function handleFile(file: File) {
    try {
      const processed = await processImage(file);
      setPending(processed);
      setAnalysis(null);
      setResultPreview(null);
      setResultOccasion(null);
      setError(null);
    } catch {
      setError("Couldn't read that image. Try a different file.");
    }
  }

  function handleClearImage() {
    setPending(null);
  }

  async function handleAnalyze() {
    if (!pending || !occasion) return;
    const occ = OCCASIONS.find(o => o.id === occasion);
    if (!occ) return;

    setLoading(true);
    setAnalysis(null);
    setResultPreview(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: pending.base64,
          mimeType: pending.mimeType,
          occasionLabel: occ.label,
          occasionContext: occ.aiContext,
          vibeGoal: vibeGoal.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Analysis failed");
        return;
      }

      setAnalysis(data.analysis);
      setResultPreview(pending.previewDataUrl);
      setResultOccasion(occ.id);

      const saved = saveHistoryEntry({
        thumbnail: pending.thumbnailDataUrl,
        occasion: occ.id,
        occasionLabel: occ.label,
        vibeGoal: vibeGoal.trim() || undefined,
        analysis: data.analysis,
      });
      setHistory(h => [saved, ...h].slice(0, 5));

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch {
      setError("Couldn't connect. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReanalyze() {
    setAnalysis(null);
    setResultPreview(null);
    setResultOccasion(null);
  }

  function handleAnalyzeAnother() {
    setPending(null);
    setOccasion(null);
    setVibeGoal("");
    setAnalysis(null);
    setResultPreview(null);
    setResultOccasion(null);
    setError(null);
  }

  function handleHistoryClick(entry: HistoryEntry) {
    setAnalysis(entry.analysis);
    setResultPreview(entry.thumbnail);
    setResultOccasion(entry.occasion);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
  }

  return (
    <main className="min-h-screen relative overflow-hidden atmosphere-glow">
      {/* Header */}
      <header className="container max-w-6xl mx-auto px-4 pt-6 pb-4 flex items-center justify-between relative">
        <FlauntLogo />
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-display italic tracking-wide">Vol. 01</span>
          <span className="h-3 w-px bg-white/15" />
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Photos analyzed, never stored
          </span>
        </div>
      </header>

      {/* Divider */}
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
          <span className="h-px flex-1 bg-white/10" />
          <span>No. 001 — Your AI Stylist</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 pt-8 pb-6 relative">
        <div className="grid md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-6 items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display italic text-brand-pink text-sm md:text-base mb-3"
            >
              <span className="mr-2">✦</span>
              an honest second opinion, before you leave the house
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display font-bold leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,5rem)]"
            >
              Don't rate.{" "}
              <span className="text-gradient-brand italic">Match.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 max-w-lg text-muted-foreground leading-relaxed"
            >
              FLAUNT is your AI stylist — the friend who actually knows fashion.
              Drop a fit, pick the occasion, get the truth in the voice of someone texting you back.
            </motion.p>
          </div>

          {/* Quote card */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-5 relative"
          >
            <Quote className="absolute -top-3 -left-3 h-6 w-6 text-brand-coral rotate-180 bg-background rounded-full p-1 border border-white/10" />
            <p className="font-display italic text-lg leading-snug text-foreground/95">
              "Tbh that jacket is carrying the whole fit — but those sneakers are{" "}
              <span className="text-gradient-brand">fighting</span> the trousers."
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              <span>— flaunt, on a tuesday</span>
              <span className="font-display normal-case italic text-brand-sparkle">★ 8.4</span>
            </div>
          </motion.aside>
        </div>
      </section>

      {/* Main Grid */}
      <section className="container max-w-6xl mx-auto px-4 pb-8 relative">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-display italic text-brand-coral text-sm">§ 01</span>
          <h2 className="font-display text-lg tracking-tight">The Fitting Room</h2>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 items-start">
          {/* Left: Inputs */}
          <div className="space-y-5 lg:sticky lg:top-6">
            <UploadDropzone
              preview={pending?.previewDataUrl ?? null}
              onFile={handleFile}
              onClear={handleClearImage}
              disabled={loading}
            />

            <OccasionPicker
              value={occasion}
              onChange={setOccasion}
              disabled={loading}
            />

            <div>
              <label className="text-sm font-medium text-foreground/90">
                Vibe goal <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                e.g., "soft launch energy", "approachable but authoritative"
              </p>
              <Input
                value={vibeGoal}
                onChange={(e) => setVibeGoal(e.target.value.slice(0, 140))}
                placeholder="What energy are you going for?"
                disabled={loading}
                className="bg-white/[0.03] border-white/10 placeholder:text-muted-foreground/50"
              />
            </div>

            {error && (
              <p className="text-sm text-brand-coral text-center font-medium">{error}</p>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-brand hover:opacity-95 text-primary-foreground shadow-glow disabled:bg-white/[0.05] disabled:bg-none disabled:text-muted-foreground disabled:shadow-none"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              {loading ? "Reading the fit…" : "Analyze my fit"}
            </Button>

            {!pending && (
              <p className="text-xs text-muted-foreground text-center">Drop a photo to get started.</p>
            )}
            {pending && !occasion && (
              <p className="text-xs text-muted-foreground text-center">Pick where you're going.</p>
            )}
          </div>

          {/* Right: Results */}
          <div ref={resultsRef}>
            <AnimatePresence mode="wait">
              {loading ? (
                <LoadingState key="loading" />
              ) : analysis && resultPreview && occasionMeta ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <ResultsCard
                    analysis={analysis}
                    preview={resultPreview}
                    occasionLabel={occasionMeta.label}
                    occasionEmoji={occasionMeta.emoji}
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReanalyze}
                      className="border-white/15 bg-white/[0.03] hover:bg-white/[0.07]"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Try different occasion
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAnalyzeAnother}
                      className="border-white/15 bg-white/[0.03] hover:bg-white/[0.07]"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Analyze another
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <EmptyState key="empty" />
              )}
            </AnimatePresence>
          </div>
        </div>

        <HistoryStrip
          entries={history}
          onSelect={handleHistoryClick}
          onClear={handleClearHistory}
        />
      </section>

      {/* Footer */}
      <footer className="container max-w-6xl mx-auto px-4 pb-8 pt-6">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mb-4">
          <span className="h-px flex-1 bg-white/10" />
          <span>Fin.</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
          <FlauntLogo size="sm" />
          <p className="font-display italic">"honest fits, no judgement."</p>
          <p>@flaunt.fit · photos processed, never stored</p>
        </div>
      </footer>
    </main>
  );
}
