import Link from 'next/link';
import Image from 'next/image';
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
  return (
    <Link href={`/pieces/${piece.id}`} className="group block rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
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
      <div className="p-3">
        <p className="font-medium text-stone-800 truncate text-sm">
          {piece.name ?? <span className="text-stone-400 italic">Unnamed piece</span>}
        </p>
        <p className="text-xs text-stone-500 truncate mt-0.5">{piece.clay_type}</p>
        <div className="flex items-center justify-between mt-2">
          <StatusBadge stage={piece.current_stage} />
          <span className="text-xs text-stone-400">{timeAgo(piece.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}
