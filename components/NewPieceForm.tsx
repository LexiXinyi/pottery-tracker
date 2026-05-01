'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getClient, BUCKET } from '@/lib/supabase';
import { StageName, STAGE_ORDER, STAGE_LABELS } from '@/lib/types';
import { takePendingFiles } from '@/lib/pendingFiles';

export default function NewPieceForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const pending = takePendingFiles();
    if (pending.length > 0) {
      setFiles(pending);
      setPreviews(pending.map((f) => URL.createObjectURL(f)));
    }
    const lastClay = typeof window !== 'undefined' ? localStorage.getItem('lastClayType') : null;
    if (lastClay) setClayType(lastClay);
  }, []);
  const [name, setName] = useState('');
  const [clayType, setClayType] = useState('');
  const [startingStage, setStartingStage] = useState<StageName>('thrown');
  const [glazeCombo, setGlazeCombo] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected?.length) return;

    const newFiles = [...files, ...Array.from(selected)];
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    setError('');
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      setProgress('Creating piece…');
      const res = await fetch('/api/pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          clay_type: clayType.trim(),
          starting_stage: startingStage,
          glaze_combo: startingStage !== 'thrown' && glazeCombo.trim() ? glazeCombo.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create piece');
      const { piece } = await res.json();
      if (typeof window !== 'undefined' && clayType.trim()) {
        localStorage.setItem('lastClayType', clayType.trim());
      }

      if (files.length > 0) {
        const db = getClient();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setProgress(`Uploading photo ${i + 1} of ${files.length}…`);
          const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const path = `${piece.id}/${startingStage}/${Date.now()}-${sanitized}`;

          const { error: uploadError } = await db.storage
            .from(BUCKET)
            .upload(path, file, { upsert: false, contentType: file.type });
          if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

          const { error: insertError } = await db.from('photos').insert({
            piece_id: piece.id,
            stage_name: startingStage,
            storage_path: path,
            original_name: file.name,
          });
          if (insertError) throw new Error(`Save failed: ${insertError.message}`);
        }
      }

      router.push(`/pieces/${piece.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  const hasPhotos = files.length > 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <Label className="mb-3 block">Photos</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {!hasPhotos ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full aspect-[4/3] border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
          >
            <span className="text-4xl">📷</span>
            <span className="font-medium text-stone-700">Add photos</span>
            <span className="text-xs text-stone-500">Take a photo or choose from your library</span>
          </button>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center leading-none"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-300 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-50"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>
          </>
        )}
      </div>

      {hasPhotos && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Banilla bowl, Mug for Mom"
              autoFocus
            />
            <p className="text-xs text-stone-500">Optional — you can name it later too</p>
          </div>

          <div className="space-y-1.5">
            <Label>Current stage</Label>
            <div className="grid grid-cols-3 gap-2">
              {STAGE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStartingStage(s)}
                  className={`h-9 rounded-md text-sm font-medium border transition-colors ${
                    startingStage === s
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clay_type">Clay body</Label>
            <Input
              id="clay_type"
              value={clayType}
              onChange={(e) => setClayType(e.target.value)}
              placeholder="e.g. Stoneware, Porcelain, B-mix 5"
            />
            <p className="text-xs text-stone-500">Date {STAGE_LABELS[startingStage].toLowerCase()}: today</p>
          </div>

          {startingStage !== 'thrown' && (
            <div className="space-y-1.5">
              <Label htmlFor="glaze_combo">Glaze combination</Label>
              <Input
                id="glaze_combo"
                value={glazeCombo}
                onChange={(e) => setGlazeCombo(e.target.value)}
                placeholder="e.g. Celadon over Shino"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          {loading && progress && <p className="text-sm text-stone-600">{progress}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving…' : 'Save Piece'}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
