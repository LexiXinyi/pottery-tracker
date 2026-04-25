'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Photo } from '@/lib/types';
import { getPhotoUrl } from '@/lib/supabase';

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getPhotoUrl(photo.storage_path)}
        alt={photo.original_name}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}

export default function PhotoGallery({ photos, append }: { photos: Photo[]; append?: React.ReactNode }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent, photo: Photo) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    setDeleting(photo.id);
    await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setLightbox(photo)}
            disabled={deleting === photo.id}
            className={`relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 ${deleting === photo.id ? 'opacity-50' : ''}`}
          >
            <Image
              src={getPhotoUrl(photo.storage_path)}
              alt={photo.original_name}
              fill
              className="object-cover"
              sizes="80px"
            />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => handleDelete(e, photo)}
              aria-label="Delete photo"
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center leading-none cursor-pointer"
            >
              ×
            </span>
          </button>
        ))}
        {append}
      </div>

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
