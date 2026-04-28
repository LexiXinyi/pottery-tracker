-- Add status column to inspos
-- Run this in your Supabase SQL Editor:
-- Project → SQL Editor → New Query → paste and run

ALTER TABLE inspos
  ADD COLUMN status TEXT NOT NULL DEFAULT 'inspired'
    CHECK (status IN ('inspired', 'making', 'commissioned', 'done'));
