import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPieceById } from '@/lib/queries';
import StageTimeline from '@/components/StageTimeline';
import PieceHeader from '@/components/PieceHeader';
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
      <PieceHeader piece={piece} />

      <StageTimeline piece={piece} />

      <div className="mt-8 pt-4 border-t border-stone-200">
        <Link href="/pieces" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          ← All Pieces
        </Link>
      </div>
    </div>
  );
}
