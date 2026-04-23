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
  const router = useRouter();

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);

    const total = files.length;
    let done = 0;

    for (const file of Array.from(files)) {
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${pieceId}/${stageName}/${Date.now()}-${sanitized}`;

      const db = getClient();
      const { error: uploadError } = await db.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (!uploadError) {
        await db.from('photos').insert({
          piece_id: pieceId,
          stage_name: stageName,
          storage_path: path,
          original_name: file.name,
        });
      }

      done++;
      setProgress(Math.round((done / total) * 100));
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
    </div>
  );
}
