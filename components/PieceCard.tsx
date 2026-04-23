'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieceWithCover } from '@/lib/types';
import StatusBadge from './StatusBadge';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
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
      </div>
      <div className="p-3 pr-10">
        <p className="font-medium text-stone-800 truncate text-sm">
          {piece.name ?? <span className="text-stone-400 italic">Unnamed piece</span>}
        </p>
        <p className="text-xs text-stone-500 truncate mt-0.5">{piece.clay_type}</p>
        <div className="flex items-center justify-between mt-2">
          <StatusBadge stage={piece.current_stage} />
          <span className="text-xs text-stone-400">{timeAgo(piece.updated_at)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="Delete piece"
        className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 active:scale-95 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      </button>
    </Link>
  );
}
