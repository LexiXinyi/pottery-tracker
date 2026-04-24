'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PieceWithCover } from '@/lib/types';
import { setPendingFiles } from '@/lib/pendingFiles';
import PieceCard from './PieceCard';

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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      <AddPieceCard />
      {pieces.map((piece) => (
        <PieceCard key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
