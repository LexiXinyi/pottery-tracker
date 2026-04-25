import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPieceById } from '@/lib/queries';
import StageTimeline from '@/components/StageTimeline';
import PieceHeader from '@/components/PieceHeader';

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
      <Link
        href="/pieces"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All pieces
      </Link>

      <PieceHeader piece={piece} />

      <StageTimeline piece={piece} />
    </div>
  );
}
