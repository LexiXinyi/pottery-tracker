import { PieceWithCover } from '@/lib/types';
import PieceCard from './PieceCard';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function PieceGrid({ pieces }: { pieces: PieceWithCover[] }) {
  if (pieces.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🏺</p>
        <p className="text-stone-500 text-lg font-medium">No pieces yet</p>
        <p className="text-stone-400 text-sm mt-1 mb-6">Start tracking your first pottery piece</p>
        <Link href="/pieces/new" className={buttonVariants()}>+ New Piece</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {pieces.map((piece) => (
        <PieceCard key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
