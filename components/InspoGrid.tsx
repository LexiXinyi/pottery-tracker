'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InspoWithUrl } from '@/lib/types';
import { getClient, BUCKET } from '@/lib/supabase';

function AddInspoTile({ onUploaded }: { onUploaded: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(true);
    setProgress(`0 / ${list.length}`);
    try {
      const db = getClient();
      let done = 0;
      await Promise.all(
        list.map(async (file, i) => {
          const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const path = `inspos/${Date.now()}-${i}-${sanitized}`;
          const { error: uploadError } = await db.storage
            .from(BUCKET)
            .upload(path, file, { upsert: false, contentType: file.type });
          if (uploadError) throw uploadError;
          const { error: insertError } = await db.from('inspos').insert({
            storage_path: path,
            original_name: file.name,
          });
          if (insertError) throw insertError;
          done++;
          setProgress(`${done} / ${list.length}`);
        })
      );
      onUploaded();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFiles}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Add inspo"
        className="group rounded-xl border-2 border-dashed border-stone-300 text-stone-400 aspect-[3/4] flex flex-col items-center justify-center gap-2 hover:bg-stone-50 hover:text-stone-600 hover:border-stone-400 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {uploading ? (
          <span className="text-xs">{progress}</span>
        ) : (
          <>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-sm font-medium">Add inspo</span>
          </>
        )}
      </button>
    </>
  );
}

function InspoTile({ inspo, onDeleted, onOpen }: { inspo: InspoWithUrl; onDeleted: () => void; onOpen: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this inspo?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inspos/${inspo.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete failed');
      onDeleted();
    } catch {
      alert('Failed to delete inspo.');
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 group block w-full ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <Image
        src={inspo.url}
        alt={inspo.original_name}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 50vw, 33vw"
      />
      <span
        role="button"
        tabIndex={0}
        onClick={handleDelete}
        aria-label="Delete inspo"
        className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      </span>
    </button>
  );
}

function Lightbox({ inspo, onClose }: { inspo: InspoWithUrl; onClose: () => void }) {
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
        src={inspo.url}
        alt={inspo.original_name}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}

export default function InspoGrid({ inspos }: { inspos: InspoWithUrl[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const refresh = () => router.refresh();
  const open = inspos.find((i) => i.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <AddInspoTile onUploaded={refresh} />
        {inspos.map((inspo) => (
          <InspoTile
            key={inspo.id}
            inspo={inspo}
            onDeleted={refresh}
            onOpen={() => setOpenId(inspo.id)}
          />
        ))}
      </div>
      {open && <Lightbox inspo={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
