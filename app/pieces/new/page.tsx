import NewPieceForm from '@/components/NewPieceForm';

export default function NewPiecePage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">New Piece</h1>
      <NewPieceForm />
    </div>
  );
}
