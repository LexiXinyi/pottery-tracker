'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="text-xs"
      >
        {uploading ? `Uploading… ${progress}%` : '+ Add Photos'}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
