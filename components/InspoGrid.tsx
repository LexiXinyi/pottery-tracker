'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InspoWithUrl, InspoStatus, INSPO_STATUS_ORDER, INSPO_STATUS_LABELS, INSPO_STATUS_COLORS } from '@/lib/types';
import { getClient, BUCKET } from '@/lib/supabase';

type StatusFilter = 'all' | InspoStatus;

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

function InspoTile({
  inspo,
  onDeleted,
  onOpen,
  onStatusChange,
}: {
  inspo: InspoWithUrl;
  onDeleted: () => void;
  onOpen: () => void;
  onStatusChange: (id: string, status: InspoStatus) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    function onDocClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [pickerOpen]);

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

  function selectStatus(e: React.MouseEvent, status: InspoStatus) {
    e.preventDefault();
    e.stopPropagation();
    setPickerOpen(false);
    if (status !== inspo.status) onStatusChange(inspo.id, status);
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
      <div ref={pickerRef} className="absolute top-1.5 left-1.5 z-10">
        <span
          role="button"
          tabIndex={0}
          aria-label="Change status"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPickerOpen((v) => !v);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border cursor-pointer ${INSPO_STATUS_COLORS[inspo.status]}`}
        >
          {INSPO_STATUS_LABELS[inspo.status]}
          <svg className="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {pickerOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-stone-200 py-1 min-w-[120px]"
          >
            {INSPO_STATUS_ORDER.map((status) => {
              const active = inspo.status === status;
              return (
                <span
                  key={status}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => selectStatus(e, status)}
                  className={`flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-stone-50 cursor-pointer ${
                    active ? 'font-semibold text-stone-900' : 'text-stone-700'
                  }`}
                >
                  {INSPO_STATUS_LABELS[status]}
                  {active && (
                    <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <span
        role="button"
        tabIndex={0}
        onClick={handleDelete}
        aria-label="Delete inspo"
        className="absolute bottom-1.5 right-1.5 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      </span>
    </button>
  );
}

function Lightbox({
  inspos,
  index,
  onClose,
  onNavigate,
  onStatusChange,
}: {
  inspos: InspoWithUrl[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
  onStatusChange: (id: string, status: InspoStatus) => void;
}) {
  const inspo = inspos[index];
  const hasPrev = index > 0;
  const hasNext = index < inspos.length - 1;
  const prevIndex = useRef(index);
  const direction: 'left' | 'right' = index >= prevIndex.current ? 'right' : 'left';
  useEffect(() => { prevIndex.current = index; }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      else if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNavigate, index, hasPrev, hasNext]);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx > 0 && hasPrev) onNavigate(index - 1);
    else if (dx < 0 && hasNext) onNavigate(index + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); }}
          aria-label="Previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); }}
          aria-label="Next"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={inspo.id}
        src={inspo.url}
        alt={inspo.original_name}
        onClick={(e) => e.stopPropagation()}
        className={`max-w-full max-h-full object-contain ${direction === 'right' ? 'lightbox-slide-from-right' : 'lightbox-slide-from-left'}`}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 bg-black/60 rounded-full px-3 py-2 z-10 max-w-[calc(100%-2rem)]"
      >
        {INSPO_STATUS_ORDER.map((status) => {
          const active = inspo.status === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(inspo.id, status)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? INSPO_STATUS_COLORS[status]
                  : 'bg-transparent text-white/80 border-white/30 hover:bg-white/10'
              }`}
            >
              {INSPO_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InspoGrid({ inspos }: { inspos: InspoWithUrl[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  // Local overrides for optimistic status updates so the UI reacts immediately
  // (server data refreshes via router.refresh() afterwards).
  const [statusOverrides, setStatusOverrides] = useState<Record<string, InspoStatus>>({});

  const refresh = () => router.refresh();

  const merged: InspoWithUrl[] = inspos.map((i) =>
    statusOverrides[i.id] ? { ...i, status: statusOverrides[i.id] } : i
  );

  const visible = filter === 'all' ? merged : merged.filter((i) => i.status === filter);
  const openIndex = openId ? visible.findIndex((i) => i.id === openId) : -1;

  async function handleStatusChange(id: string, status: InspoStatus) {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
    try {
      const res = await fetch(`/api/inspos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('update failed');
      router.refresh();
    } catch {
      alert('Failed to update status.');
      // Roll back the optimistic change
      setStatusOverrides((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    }
  }

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...INSPO_STATUS_ORDER.map((s) => ({ value: s as StatusFilter, label: INSPO_STATUS_LABELS[s] })),
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((opt) => {
          const active = filter === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {filter === 'all' && <AddInspoTile onUploaded={refresh} />}
        {visible.map((inspo) => (
          <InspoTile
            key={inspo.id}
            inspo={inspo}
            onDeleted={refresh}
            onOpen={() => setOpenId(inspo.id)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
      {openIndex >= 0 && (
        <Lightbox
          inspos={visible}
          index={openIndex}
          onClose={() => setOpenId(null)}
          onNavigate={(i) => setOpenId(visible[i].id)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
