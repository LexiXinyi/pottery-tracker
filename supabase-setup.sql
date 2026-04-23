-- Run this in your Supabase SQL Editor
-- Go to: your project → SQL Editor → New Query → paste and run

-- 1. Pieces table
CREATE TABLE pieces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  clay_type     TEXT NOT NULL,
  glaze_combo   TEXT,
  notes         TEXT,
  current_stage TEXT NOT NULL DEFAULT 'thrown'
    CHECK (current_stage IN ('thrown', 'glazed', 'final')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Stages table (3 rows pre-created per piece)
CREATE TABLE stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id    UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  stage_name  TEXT NOT NULL CHECK (stage_name IN ('thrown', 'glazed', 'final')),
  stage_date  DATE,
  completed   BOOLEAN DEFAULT FALSE,
  UNIQUE (piece_id, stage_name)
);

-- 3. Photos table
CREATE TABLE photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id      UUID NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  stage_name    TEXT NOT NULL CHECK (stage_name IN ('thrown', 'glazed', 'final')),
  storage_path  TEXT NOT NULL,
  original_name TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ DEFAULT now()
);

-- 4. Auto-update updated_at on pieces
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pieces_updated_at
  BEFORE UPDATE ON pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Enable Row Level Security (allows anonymous reads/writes for personal use)
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON pieces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON photos FOR ALL USING (true) WITH CHECK (true);
