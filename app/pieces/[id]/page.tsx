import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPieceById } from '@/lib/queries';
import StatusBadge from '@/components/StatusBadge';
import StageTimeline from '@/components/StageTimeline';
import { buttonVariants } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function PieceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const piece = await getPieceById(id);
  if (!piece) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            {piece.name ?? <span className="italic text-stone-400">Unnamed piece</span>}
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{piece.clay_type}</p>
          {piece.glaze_combo && (
            <p className="text-stone-500 text-sm">Glaze: {piece.glaze_combo}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge stage={piece.current_stage} />
          <Link href={`/pieces/${piece.id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Edit
          </Link>
        </div>
      </div>

      {piece.notes && (
        <p className="text-sm text-stone-600 bg-stone-100 rounded-lg px-3 py-2 mt-3">{piece.notes}</p>
      )}

      <StageTimeline piece={piece} />

      <div className="mt-8 pt-4 border-t border-stone-200">
        <Link href="/pieces" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← All Pieces
        </Link>
      </div>
    </div>
  );
}
