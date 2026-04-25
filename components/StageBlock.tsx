'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stage, Photo, StageName, STAGE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoGallery from './PhotoGallery';
import PhotoUploader from './PhotoUploader';

interface Props {
  stage: Stage;
  photos: Photo[];
  pieceId: string;
  currentStage: StageName;
  glazeCombo: string | null;
  clayType: string;
}

export default function StageBlock({ stage, photos, pieceId, currentStage, glazeCombo, clayType }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(stage.stage_date ?? new Date().toISOString().split('T')[0]);
  const [glaze, setGlaze] = useState(glazeCombo ?? '');
  const [clay, setClay] = useState(clayType);

  const isCurrent = stage.stage_name === currentStage;
  const isCompleted = stage.completed;
  const isGlazedStage = stage.stage_name === 'glazed';
  const isThrownStage = stage.stage_name === 'thrown';
  const [expanded, setExpanded] = useState(isCurrent);

  async function markDone() {
    setSaving(true);

    if (isGlazedStage && glaze.trim() && glaze.trim() !== (glazeCombo ?? '')) {
      await fetch(`/api/pieces/${pieceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glaze_combo: glaze.trim() }),
      });
    }

    await fetch(`/api/pieces/${pieceId}/stages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_name: stage.stage_name, stage_date: date }),
    });
    setSaving(false);
    router.refresh();
  }

  async function saveDate(newDate: string) {
    setDate(newDate);
    if (!isCompleted) return;
    await fetch(`/api/pieces/${pieceId}/stages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_name: stage.stage_name, stage_date: newDate }),
    });
    router.refresh();
  }

  async function saveClay() {
    const next = clay.trim();
    if (next === clayType) return;
    await fetch(`/api/pieces/${pieceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clay_type: next }),
    });
    router.refresh();
  }

  async function saveGlaze() {
    if (glaze.trim() === (glazeCombo ?? '')) return;
    await fetch(`/api/pieces/${pieceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glaze_combo: glaze.trim() || null }),
    });
    router.refresh();
  }

  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      <div className="absolute left-2.5 top-3 bottom-0 w-0.5 bg-stone-200 last:hidden" />
      <div className={`absolute left-0 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
        ${isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-white border-stone-800' : 'bg-white border-stone-300'}`}>
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className={`rounded-xl border ${isCurrent ? 'border-stone-800 bg-white shadow-sm' : 'border-stone-200 bg-white'}`}>
        <div className="flex items-center justify-between gap-2 p-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 flex-1 text-left"
            aria-expanded={expanded}
          >
            <svg
              className={`w-4 h-4 text-stone-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <h3 className="font-semibold text-stone-800">{STAGE_LABELS[stage.stage_name]}</h3>
            {!expanded && stage.stage_date && (
              <span className="text-xs text-stone-500">{stage.stage_date}</span>
            )}
          </button>
          <button
            type="button"
            onClick={markDone}
            disabled={saving}
            aria-label={isCompleted ? 'Completed' : 'Mark done'}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-stone-300 text-transparent hover:border-stone-500 hover:text-stone-400'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {expanded && (
          <div className="px-4 pb-4 -mt-1">
            <div className="flex items-center justify-end gap-2 flex-wrap mb-3">
              <Input
                type="date"
                value={date}
                onChange={(e) => saveDate(e.target.value)}
                className="h-7 text-xs w-36 px-2"
              />
            </div>
            <PhotoGallery
              photos={photos}
              append={<PhotoUploader pieceId={pieceId} stageName={stage.stage_name} />}
            />

        {isThrownStage && (
          <div className="mt-3">
            <label className="text-xs text-stone-600 font-medium block mb-1">
              Clay body
            </label>
            <Input
              value={clay}
              onChange={(e) => setClay(e.target.value)}
              onBlur={saveClay}
              placeholder="e.g. B-mix 5"
              className="h-8 text-sm"
            />
          </div>
        )}

        {isGlazedStage && (
          <div className="mt-3">
            <label className="text-xs text-stone-600 font-medium block mb-1">
              Glaze combination
            </label>
            <Input
              value={glaze}
              onChange={(e) => setGlaze(e.target.value)}
              onBlur={saveGlaze}
              placeholder="e.g. Celadon over Shino"
              className="h-8 text-sm"
            />
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}
