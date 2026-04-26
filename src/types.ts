export type Occasion = 
  | 'casual' 
  | 'office' 
  | 'formal' 
  | 'wedding' 
  | 'date' 
  | 'traditional' 
  | 'street' 
  | 'gym' 
  | 'party';

export interface AnalysisResponse {
  vibe_check: string;
  the_good: string;
  the_fix: string;
  is_it_a_yes: 'yes' | 'maybe' | 'no';
  scores: {
    overall: number;
    occasion_match: number;
    color_game: number;
    fit_silhouette: number;
    style_points: number;
  };
  items_spotted: string[];
  final_note: string;
}

export interface OccasionInfo {
  id: Occasion;
  label: string;
  description: string;
  icon: string; // Lucide icon name or emoji
}
