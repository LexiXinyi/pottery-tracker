import { notFound } from 'next/navigation';
import { getPieceById } from '@/lib/queries';
import EditPieceForm from '@/components/EditPieceForm';

export const dynamic = 'force-dynamic';

export default async function EditPiecePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const piece = await getPieceById(id);
  if (!piece) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Edit Piece</h1>
      <EditPieceForm piece={piece} />
    </div>
  );
}
