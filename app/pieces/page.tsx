import { getAllPieces } from '@/lib/queries';
import PieceGrid from '@/components/PieceGrid';

export const dynamic = 'force-dynamic';

export default async function PiecesPage() {
  const pieces = await getAllPieces();
  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">My Pieces</h1>
      <PieceGrid pieces={pieces} />
    </div>
  );
}
