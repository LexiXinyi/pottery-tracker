'use client';

import { useRouter } from 'next/navigation';
import { Piece } from '@/lib/types';
import StatusBadge from './StatusBadge';
import InlineText from './InlineText';

export default function PieceHeader({ piece }: { piece: Piece }) {
  const router = useRouter();

  async function patch(data: Partial<Pick<Piece, 'name' | 'clay_type' | 'glaze_combo' | 'notes'>>) {
    const body: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(data)) {
      body[k] = v === '' ? null : v ?? null;
    }
    await fetch(`/api/pieces/${piece.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-stone-800">
            <InlineText
              value={piece.name}
              placeholder="Unnamed piece"
              onSave={(v) => patch({ name: v })}
              emptyClassName="italic text-stone-400"
            />
          </div>
        </div>
        <div className="flex-shrink-0 pt-1">
          <StatusBadge stage={piece.current_stage} />
        </div>
      </div>

      <div className="text-sm text-stone-600 mt-2">
        <InlineText
          value={piece.notes}
          placeholder="Add notes…"
          onSave={(v) => patch({ notes: v })}
          multiline
          emptyClassName="text-stone-400 italic"
        />
      </div>
    </div>
  );
}
