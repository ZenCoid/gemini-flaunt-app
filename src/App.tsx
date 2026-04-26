import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ChevronRight, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';
import { Occasion, AnalysisResponse, OccasionInfo } from './types.ts';

const OCCASIONS: OccasionInfo[] = [
  { id: 'casual', label: 'Casual', description: 'Day out with friends', icon: '👕' },
  { id: 'office', label: 'Office', description: 'Professional vibe', icon: '💼' },
  { id: 'formal', label: 'Formal', description: 'Gala or fancy dinner', icon: '👔' },
  { id: 'wedding', label: 'Wedding Guest', description: 'Wedding/Reception', icon: '💍' },
  { id: 'date', label: 'Date Night', description: 'First impressions', icon: '🌹' },
  { id: 'traditional', label: 'Traditional', description: 'Mehndi/Dholki/Nikah', icon: '✨' },
  { id: 'street', label: 'Street Style', description: 'Urban expression', icon: '👟' },
  { id: 'gym', label: 'Gym/Workout', description: 'Fitness activity', icon: '🏋️' },
  { id: 'party', label: 'Party', description: 'Club or night out', icon: '🥂' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>('casual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{image: string, result: AnalysisResponse, occasion: string}[]>(() => {
    const saved = localStorage.getItem('flaunt_history');
    return saved ? JSON.parse(saved) : [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError('Image exceeds 20MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFit = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

      const ai = new GoogleGenAI({ apiKey });
      const base64Image = image.split(',')[1];
      const mimeType = image.match(/data:(.*?);/)?.[1] || 'image/jpeg';

      const prompt = `
You're not an AI. You're that one friend who ACTUALLY knows fashion — the one people send outfit pics to before going out. You're honest but not mean. You notice details others miss. You give real feedback, not generic advice.

CONTEXT: The person is getting ready for a ${selectedOccasion} occasion.

HOW TO RESPOND:
1. First, look at what they're ACTUALLY wearing. Identify the real pieces.
2. Think: Does this work for where they're going? Would I nod approvingly or gently suggest a change?
3. Write like you're texting them back. Casual, direct, personal.

IMPORTANT RULES:
- Be specific to what you ACTUALLY see in the photo.
- Never say "Consider adding..." or "You might want to..." — that sounds robotic.
- Instead say: "Honestly, this jacket is carrying the whole fit" or "Those shoes are fighting with the pants".
- If something is great, say WHY specifically.
- If something could be better, say WHAT exactly.
- Use natural language: "lowkey", "kinda", "actually", "honestly", "tbh", "vibe", "fit", "solid", "carrying", "fighting".
- Scores are secondary — the words matter more.

RESPONSE FORMAT (JSON):
{
  "vibe_check": "<1-2 sentences: immediate honest reaction to the outfit>",
  "the_good": "<2-3 sentences: what's actually working, be specific>",
  "the_fix": "<1-2 sentences: one specific, actionable improvement>",
  "is_it_a_yes": "<yes/maybe/no — would you let them leave like this?>",
  "scores": {
    "overall": <1-10 with decimal>,
    "occasion_match": <1-10>,
    "color_game": <1-10>,
    "fit_silhouette": <1-10>,
    "style_points": <1-10>
  },
  "items_spotted": ["<actual items visible in image>"],
  "final_note": "<2-3 sentences: parting thought, like a friend signing off>"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ]
      });

      const responseText = response.text;
      const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (analysis) {
        setResult(analysis);
        const newHistory = [{ image, result: analysis, occasion: selectedOccasion }, ...history.slice(0, 4)];
        setHistory(newHistory);
        localStorage.setItem('flaunt_history', JSON.stringify(newHistory));
      } else {
        setError('Analysis failed. Try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to analyze outfit. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const ScoreBar = ({ label, score, index }: { label: string, score: number, index: number }) => (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="space-y-1.5"
    >
      <div className="flex justify-between text-[11px] font-semibold tracking-wider uppercase">
        <span className="text-gray-500">{label.replace(/_/g, ' ')}</span>
        <span className="text-white font-mono">{score.toFixed(1)}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: 0.2 + (0.1 * index) }}
          className={cn(
            "h-full rounded-full",
            score >= 8 ? "bg-emerald-400" : score >= 5 ? "bg-amber-400" : "bg-rose-500"
          )}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen atmosphere-glow">
      <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-16">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-brand opacity-10 group-hover:opacity-30 transition-opacity" />
              <span className="font-serif italic text-3xl text-gradient relative z-10 -mb-1">f</span>
              <Sparkles className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-300" />
            </motion.div>
            <div>
              <h1 className="font-serif font-bold text-3xl tracking-tight leading-none italic">flaunt<span className="text-pink-400">.</span></h1>
              <p className="text-gray-500 text-[11px] uppercase tracking-[0.2em] mt-1.5 font-bold">Editorial Style Intelligence</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest font-bold text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Digital Closet</a>
              <a href="#" className="hover:text-white transition-colors">Style Trends</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            {history.length > 0 && !image && (
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('flaunt_history');
                }}
                className="text-gray-500 hover:text-rose-400 transition-colors text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Visual Node */}
          <div className={cn("lg:col-span-5 space-y-10", result && "lg:col-span-4")}>
            <div className="space-y-4">
              <div 
                className={cn(
                  "relative rounded-[40px] transition-all duration-700 overflow-hidden",
                  !image ? "aspect-[4/5] glass-card cursor-pointer hover:border-white/20" : "aspect-auto max-h-[600px]",
                  isAnalyzing && "grayscale blur-sm opacity-50 scale-95"
                )}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                <AnimatePresence mode="wait">
                  {!image ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                    >
                      <div className="relative mb-8">
                        <Camera className="w-16 h-16 text-white/10 group-hover:text-pink-400 transition-colors" />
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-pink-500/20 blur-xl"
                        />
                      </div>
                      <h2 className="font-serif italic text-3xl mb-4">"Upload your silhouette."</h2>
                      <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed">
                        Drag your outfit photo here or tap to select from your collection.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="preview"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full"
                    >
                      <img 
                        src={image} 
                        alt="Outfit preview" 
                        className="w-full h-full object-cover rounded-[40px]"
                      />
                      {!result && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="absolute top-6 right-6 p-3 rounded-full glass hover:bg-white/10 text-white transition-all active:scale-90"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {image && !result && !isAnalyzing && (
                <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">Image loaded successfully</p>
              )}
            </div>

            {/* Selection Grid */}
            <AnimatePresence>
              {!result && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-10"
                >
                  <div className=" space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-[1px] flex-1 bg-white/5" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Context Calibration</span>
                      <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {OCCASIONS.map((occ, idx) => (
                        <motion.button
                          key={occ.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => setSelectedOccasion(occ.id)}
                          className={cn(
                            "group flex flex-col items-center justify-center p-5 rounded-[24px] transition-all duration-500 relative overflow-hidden",
                            selectedOccasion === occ.id 
                              ? "glass shadow-2xl shadow-pink-500/10 border-white/20" 
                              : "border border-transparent opacity-60 hover:opacity-100 hover:bg-white/5"
                          )}
                        >
                          <span className={cn(
                            "text-2xl mb-2 transition-all duration-500",
                            selectedOccasion === occ.id ? "scale-110" : "grayscale"
                          )}>{occ.icon}</span>
                          <span className="text-[11px] font-bold uppercase tracking-wider">{occ.label}</span>
                          {selectedOccasion === occ.id && (
                            <motion.div 
                              layoutId="selection-glow"
                              className="absolute inset-0 bg-gradient-brand opacity-[0.03]" 
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!image || isAnalyzing}
                    onClick={analyzeFit}
                    className={cn(
                      "group relative w-full py-6 rounded-[28px] font-bold text-sm uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden active:scale-95",
                      image && !isAnalyzing 
                        ? "text-black" 
                        : "text-gray-500 cursor-not-allowed bg-white/5"
                    )}
                  >
                    {image && !isAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-brand animate-gradient-x" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Style Data
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                          Generate Verdict
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Result Node */}
          <div className={cn("lg:col-span-7", result && "lg:col-span-8")}>
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing ? (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col"
                >
                  {history.length > 0 ? (
                    <div className="space-y-12">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500">
                           <History className="w-4 h-4" />
                           Archives
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {history.map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => {
                              setImage(h.image);
                              setResult(h.result);
                              setSelectedOccasion(h.occasion as Occasion);
                            }}
                            className="group relative aspect-[10/16] rounded-3xl overflow-hidden glass-card cursor-pointer hover:translate-y-[-8px] transition-all duration-500"
                          >
                            <img src={h.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black via-black/50 to-transparent">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400 mb-1">{h.occasion}</p>
                              <div className="flex justify-between items-end">
                                <span className="font-serif italic text-xl">{h.result.scores.overall}</span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                       <div className="w-24 h-24 border border-white rounded-full flex items-center justify-center">
                          <Sparkles className="w-10 h-10" />
                       </div>
                       <p className="font-serif italic text-2xl">Awaiting submission.</p>
                    </div>
                  )}
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[500px] text-center space-y-12"
                >
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border border-white/5 border-t-pink-500 animate-spin transition-all duration-[3000ms] border-t-[3px]" />
                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-amber-300 animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif italic text-4xl text-shadow-glow">Consulting the oracle.</h3>
                    <p className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-bold">Scanning silhouette & Color Profile</p>
                  </div>
                </motion.div>
              ) : result && (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="space-y-10"
                >
                  {/* Verdict Display */}
                  <div className="relative">
                    <div className="absolute top-0 right-0 z-20 flex flex-col items-end">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="font-serif italic text-[120px] leading-none tracking-tighter text-gradient"
                      >
                        {result.scores.overall}
                      </motion.div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 -mt-2">Stylist Verdict</span>
                    </div>

                    <div className="glass-card rounded-[48px] p-12 pt-16 space-y-12 overflow-hidden relative">
                      <div className="absolute top-0 left-12 w-1 h-32 bg-linear-to-b from-pink-500/40 to-transparent" />
                      
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[24px] flex items-center justify-center relative shadow-inner",
                          result.is_it_a_yes === 'yes' ? "bg-emerald-400/10 text-emerald-400" : 
                          result.is_it_a_yes === 'maybe' ? "bg-amber-400/10 text-amber-400" : "bg-rose-400/10 text-rose-400"
                        )}>
                          {result.is_it_a_yes === 'yes' ? <CheckCircle2 className="w-8 h-8" /> : 
                           result.is_it_a_yes === 'maybe' ? <AlertCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <div>
                          <h2 className="font-serif font-bold text-5xl tracking-tight leading-none italic mb-2">
                             {result.is_it_a_yes === 'yes' ? "The Final Yes." : 
                              result.is_it_a_yes === 'maybe' ? "Calibration Req." : "Standard Rejection."}
                          </h2>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{selectedOccasion} Compatibility Check</p>
                        </div>
                      </div>

                      <div className="space-y-12 relative z-10">
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-serif text-3xl md:text-4xl text-white/90 leading-[1.3] italic border-l-2 border-white/5 pl-10 py-2"
                        >
                          "{result.vibe_check}"
                        </motion.p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                          <div className="space-y-6">
                            <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400">
                               <div className="h-4 w-1 bg-emerald-400 rounded-full" />
                               Strengths
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                              {result.the_good}
                            </p>
                          </div>
                          
                          <div className="space-y-6">
                            <h4 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-pink-400">
                               <div className="h-4 w-1 bg-pink-400 rounded-full" />
                               Adjustments
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                              {result.the_fix}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8 flex flex-wrap gap-3 border-t border-white/5">
                        {result.items_spotted.map((item, i) => (
                          <span key={i} className="px-4 py-2 rounded-full glass text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors cursor-default">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5 glass-card rounded-[40px] p-10 space-y-8">
                       <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">Metrics</h3>
                       <div className="space-y-6">
                          <ScoreBar index={0} label="Context Match" score={result.scores.occasion_match} />
                          <ScoreBar index={1} label="Color Theory" score={result.scores.color_game} />
                          <ScoreBar index={2} label="Silhouette" score={result.scores.fit_silhouette} />
                          <ScoreBar index={3} label="Aesthetic IQ" score={result.scores.style_points} />
                       </div>
                    </div>

                    <div className="md:col-span-7 glass-card rounded-[40px] p-10 flex flex-col justify-between group">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">Editorial Note</div>
                        </div>
                        <p className="font-serif italic text-2xl text-white/70 leading-relaxed">
                          {result.final_note}
                        </p>
                      </div>
                      
                      <button 
                        onClick={reset}
                        className="mt-12 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-pink-400 hover:text-white transition-all group-hover:translate-x-2 duration-500"
                      >
                        Reset Profile <ChevronRight className="w-5 h-5 flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-8 p-6 rounded-[32px] bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-4 glass"
              >
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold uppercase tracking-widest text-[10px] mb-0.5">System Error</p>
                  <p className="opacity-80 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </main>

        <footer className="pt-24 pb-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-xl text-white/10 select-none">f.</span>
            <span>© 2024 flaunt.fit</span>
          </div>
          
          <div className="flex gap-12">
            <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
            <a href="#" className="hover:text-pink-400 transition-colors">TikTok</a>
            <a href="#" className="hover:text-pink-400 transition-colors">Pinterest</a>
          </div>
          
          <div className="flex gap-12 text-[10px]">
            <a href="#" className="hover:text-white transition-colors">Privacy Collective</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
