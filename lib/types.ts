export type StageName = 'thrown' | 'glazed' | 'final';

export const STAGE_ORDER: StageName[] = ['thrown', 'glazed', 'final'];

export const STAGE_LABELS: Record<StageName, string> = {
  thrown: 'Bisque',
  glazed: 'Glaze',
  final: 'Voilà',
};

export const STAGE_COLORS: Record<StageName, string> = {
  thrown: 'bg-slate-100 text-slate-700 border-slate-200',
  glazed: 'bg-sky-100 text-sky-700 border-sky-200',
  final: 'bg-green-100 text-green-700 border-green-200',
};

export interface Piece {
  id: string;
  name: string | null;
  clay_type: string;
  glaze_combo: string | null;
  notes: string | null;
  current_stage: StageName;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  piece_id: string;
  stage_name: StageName;
  stage_date: string | null;
  completed: boolean;
}

export interface Photo {
  id: string;
  piece_id: string;
  stage_name: StageName;
  storage_path: string;
  original_name: string;
  uploaded_at: string;
}

export interface PieceWithDetails extends Piece {
  stages: Stage[];
  photos: Photo[];
}

export interface PieceWithCover extends Piece {
  cover_url: string | null;
}
