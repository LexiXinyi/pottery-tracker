'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClient, BUCKET } from '@/lib/supabase';
import { StageName } from '@/lib/types';

interface Props {
  pieceId: string;
  stageName: StageName;
}

export default function PhotoUploader({ pieceId, stageName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setError('');
    setProgress(0);

    const total = files.length;
    let done = 0;
    const db = getClient();

    for (const file of Array.from(files)) {
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${pieceId}/${stageName}/${Date.now()}-${sanitized}`;

      const { error: uploadError } = await db.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { error: insertError } = await db.from('photos').insert({
        piece_id: pieceId,
        stage_name: stageName,
        storage_path: path,
        original_name: file.name,
      });

      if (insertError) {
        setError(`Save failed: ${insertError.message}`);
        setUploading(false);
        return;
      }

      done++;
      setProgress(Math.round((done / total) * 100));
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        aria-label="Add photo"
        className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 text-stone-400 flex items-center justify-center hover:bg-stone-50 hover:text-stone-600 hover:border-stone-400 active:scale-95 transition-all disabled:opacity-50"
      >
        {uploading ? (
          <span className="text-xs">{progress}%</span>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
