'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieceWithCover } from '@/lib/types';
import StatusBadge from './StatusBadge';

function DeleteButton({ onClick, disabled }: { onClick: (e: React.MouseEvent) => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Delete piece"
      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-stone-300 hover:text-red-500 active:scale-95 transition-all"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
      </svg>
    </button>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PieceCard({ piece }: { piece: PieceWithCover }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = piece.name ?? 'this piece';
    if (!confirm(`Delete ${label} and all its photos? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pieces/${piece.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      router.refresh();
    } catch {
      alert('Failed to delete piece.');
      setDeleting(false);
    }
  }

  return (
    <Link
      href={`/pieces/${piece.id}`}
      className={`group block rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-shadow relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {piece.cover_url ? (
          <Image
            src={piece.cover_url}
            alt={piece.name ?? 'Pottery piece'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-stone-300">
            🏺
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge stage={piece.current_stage} />
        </div>
        <span className="absolute top-2 right-2 text-[11px] font-medium text-white bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
          {formatDate(piece.updated_at)}
        </span>
      </div>
      <div className="p-3">
        <p className="font-medium text-stone-800 truncate text-sm">
          {piece.name ?? <span className="text-stone-400 italic">Unnamed piece</span>}
        </p>
        {piece.glaze_combo ? (
          <>
            <p className="text-xs text-stone-500 truncate mt-0.5">{piece.clay_type}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-stone-500 truncate">{piece.glaze_combo}</p>
              <DeleteButton onClick={handleDelete} disabled={deleting} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p className="text-xs text-stone-500 truncate">{piece.clay_type}</p>
            <DeleteButton onClick={handleDelete} disabled={deleting} />
          </div>
        )}
      </div>
    </Link>
  );
}
