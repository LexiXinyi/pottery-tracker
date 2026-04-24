'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Photo } from '@/lib/types';
import { getPhotoUrl } from '@/lib/supabase';

export default function PhotoGallery({ photos, append }: { photos: Photo[]; append?: React.ReactNode }) {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(photo: Photo) {
    if (!confirm('Delete this photo?')) return;
    setDeleting(photo.id);
    await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group w-20 h-20 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
            <Image
              src={getPhotoUrl(photo.storage_path)}
              alt={photo.original_name}
              fill
              className="object-cover cursor-pointer"
              sizes="80px"
              onClick={() => setLightbox(photo)}
            />
            <button
              onClick={() => handleDelete(photo)}
              disabled={deleting === photo.id}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 text-xs items-center justify-center hidden group-hover:flex leading-none"
              aria-label="Delete photo"
            >
              ×
            </button>
          </div>
        ))}
        {append}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black">
          {lightbox && (
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={getPhotoUrl(lightbox.storage_path)}
                alt={lightbox.original_name}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
