import Link from 'next/link';
import { PieceWithCover } from '@/lib/types';
import PieceCard from './PieceCard';

function AddPieceCard() {
  return (
    <Link
      href="/pieces/new"
      aria-label="Add new piece"
      className="group aspect-square rounded-xl bg-white border border-stone-200 text-stone-900 flex items-center justify-center hover:bg-stone-50 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <svg
        className="w-12 h-12 stroke-stone-900"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
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
