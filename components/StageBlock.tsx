'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stage, Photo, StageName, STAGE_LABELS, STAGE_ORDER } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhotoGallery from './PhotoGallery';
import PhotoUploader from './PhotoUploader';

interface Props {
  stage: Stage;
  photos: Photo[];
  pieceId: string;
  currentStage: StageName;
}

export default function StageBlock({ stage, photos, pieceId, currentStage }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(stage.stage_date ?? new Date().toISOString().split('T')[0]);

  const stageIndex = STAGE_ORDER.indexOf(stage.stage_name);
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const isCurrent = stage.stage_name === currentStage;
  const isFuture = stageIndex > currentIndex;
  const isCompleted = stage.completed;

  async function markDone() {
    setSaving(true);
    await fetch(`/api/pieces/${pieceId}/stages`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage_name: stage.stage_name, stage_date: date }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className={`relative pl-8 pb-8 last:pb-0 ${isFuture ? 'opacity-40' : ''}`}>
      {/* Timeline line */}
      <div className="absolute left-2.5 top-3 bottom-0 w-0.5 bg-stone-200 last:hidden" />

      {/* Dot */}
      <div className={`absolute left-0 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
        ${isCompleted ? 'bg-green-500 border-green-500' : isCurrent ? 'bg-white border-stone-800' : 'bg-white border-stone-300'}`}>
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className={`rounded-xl border p-4 ${isCurrent ? 'border-stone-800 bg-white shadow-sm' : 'border-stone-200 bg-white'}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-stone-800">{STAGE_LABELS[stage.stage_name]}</h3>
          {!isFuture && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isCompleted}
                className="h-7 text-xs w-36 px-2"
              />
              {!isCompleted && isCurrent && (
                <Button size="sm" onClick={markDone} disabled={saving} className="h-7 text-xs">
                  {saving ? 'Saving…' : 'Mark Done'}
                </Button>
              )}
            </div>
          )}
        </div>

        {!isFuture && (
          <div className="mt-3">
            <PhotoGallery photos={photos} />
            {!isFuture && <div className="mt-2"><PhotoUploader pieceId={pieceId} stageName={stage.stage_name} /></div>}
          </div>
        )}
      </div>
    </div>
  );
}
