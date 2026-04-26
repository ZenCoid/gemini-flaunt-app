import { z } from "zod";

export const OCCASIONS = [
  {
    id: "casual",
    label: "Casual",
    emoji: "☕",
    description: "Day out, errands, hanging with friends",
    aiContext: "Comfort is key but it shouldn't look sloppy. Effortless but put-together. Lived-in beats overdone.",
  },
  {
    id: "office",
    label: "Office / Work",
    emoji: "💼",
    description: "Professional environment",
    aiContext: "Professional but personality is allowed. Nothing too flashy. Fit and fabric matter more than logos.",
  },
  {
    id: "formal",
    label: "Formal Event",
    emoji: "🥂",
    description: "Gala, awards, fancy dinner",
    aiContext: "Elegant and sophisticated. Time to dress up properly. Tailoring and polish are everything.",
  },
  {
    id: "wedding-guest",
    label: "Wedding Guest",
    emoji: "💐",
    description: "Wedding reception, walima",
    aiContext: "Celebratory but never upstage the couple. Avoid white at Western weddings unless culturally appropriate. Lean into colour and texture.",
  },
  {
    id: "date-night",
    label: "Date Night",
    emoji: "🌹",
    description: "Romantic date, first impressions",
    aiContext: "Show personality, look put-together, memorable but not try-hard. One statement piece beats ten.",
  },
  {
    id: "dholki",
    label: "Dholki / Mehndi",
    emoji: "🪘",
    description: "South Asian wedding celebration",
    aiContext: "Colourful, festive, bold is encouraged. Traditional or fusion both work. Yellows, greens, oranges hit hard. Embroidery and mirrorwork are welcome.",
  },
  {
    id: "nikah",
    label: "Nikah",
    emoji: "🕌",
    description: "Islamic wedding ceremony",
    aiContext: "Modest and elegant. Respectful of religious significance. Soft tones, refined silhouettes, full coverage when appropriate.",
  },
  {
    id: "street",
    label: "Street Style",
    emoji: "🛹",
    description: "Urban, creative expression",
    aiContext: "Bold choices, unique combinations, individuality shines. Layering, texture mixing and unexpected proportions all reward.",
  },
  {
    id: "gym",
    label: "Gym / Workout",
    emoji: "🏋️",
    description: "Fitness activity",
    aiContext: "Functional first, but looking good motivates. Proper fit matters. Sweat-friendly fabrics.",
  },
  {
    id: "party",
    label: "Party",
    emoji: "🪩",
    description: "Club, night out with friends",
    aiContext: "Fun, eye-catching, more daring than usual. Shine, sparkle, leather, latex — all on the table. Comfort still counts because you'll be on your feet.",
  },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];

export const ScoresSchema = z.object({
  overall: z.number().min(1).max(10),
  occasion_match: z.number().min(1).max(10),
  color_game: z.number().min(1).max(10),
  fit_silhouette: z.number().min(1).max(10),
  style_points: z.number().min(1).max(10),
});

export const AnalysisSchema = z.object({
  vibe_check: z.string().min(1),
  the_good: z.string().min(1),
  the_fix: z.string().min(1),
  is_it_a_yes: z.enum(["yes", "maybe", "no"]),
  scores: ScoresSchema,
  items_spotted: z.array(z.string()).default([]),
  final_note: z.string().min(1),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
export type Scores = z.infer<typeof ScoresSchema>;

export interface HistoryEntry {
  id: string;
  thumbnail: string;
  occasion: OccasionId;
  occasionLabel: string;
  vibeGoal?: string;
  analysis: Analysis;
  timestamp: number;
}

export const SCORE_LABELS: Record<keyof Scores, string> = {
  overall: "Overall",
  occasion_match: "Occasion Match",
  color_game: "Color Game",
  fit_silhouette: "Fit & Silhouette",
  style_points: "Style Points",
};
