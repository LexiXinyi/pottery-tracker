'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieceWithCover, StageName, STAGE_ORDER, STAGE_LABELS } from '@/lib/types';
import { setPendingFiles } from '@/lib/pendingFiles';
import PieceCard from './PieceCard';

type StageFilter = 'all' | StageName;

function AddPieceCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setPendingFiles(Array.from(files));
    router.push('/pieces/new');
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFiles}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Add new piece"
        className="group h-full rounded-xl border-2 border-dashed border-stone-300 text-stone-400 flex flex-col items-center justify-center gap-2 hover:bg-stone-50 hover:text-stone-600 hover:border-stone-400 active:scale-[0.98] transition-all"
      >
        <svg
          className="w-10 h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span className="text-sm font-medium">New piece</span>
      </button>
    </>
  );
}

export default function PieceGrid({ pieces }: { pieces: PieceWithCover[] }) {
  const [filter, setFilter] = useState<StageFilter>('all');

  const visible = filter === 'all' ? pieces : pieces.filter((p) => p.current_stage === filter);

  const filterOptions: { value: StageFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...STAGE_ORDER.map((s) => ({ value: s as StageFilter, label: STAGE_LABELS[s] })),
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {filter === 'all' && <AddPieceCard />}
        {visible.map((piece) => (
          <PieceCard key={piece.id} piece={piece} />
        ))}
      </div>
    </>
  );
}
