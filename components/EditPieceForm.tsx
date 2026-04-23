'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Piece } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function EditPieceForm({ piece }: { piece: Piece }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim() || null,
      clay_type: (form.elements.namedItem('clay_type') as HTMLInputElement).value.trim(),
      glaze_combo: (form.elements.namedItem('glaze_combo') as HTMLInputElement).value.trim() || null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim() || null,
    };

    try {
      const res = await fetch(`/api/pieces/${piece.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      router.push(`/pieces/${piece.id}`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this piece and all its photos? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await fetch(`/api/pieces/${piece.id}`, { method: 'DELETE' });
      router.push('/pieces');
      router.refresh();
    } catch {
      setError('Failed to delete piece.');
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-stone-200 p-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name <span className="text-stone-400 font-normal">(optional)</span></Label>
        <Input id="name" name="name" defaultValue={piece.name ?? ''} placeholder="e.g. Bowl #3" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clay_type">Clay Type <span className="text-red-400">*</span></Label>
        <Input id="clay_type" name="clay_type" required defaultValue={piece.clay_type} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="glaze_combo">Glaze Combination</Label>
        <Input id="glaze_combo" name="glaze_combo" defaultValue={piece.glaze_combo ?? ''} placeholder="e.g. Celadon over Shino" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={piece.notes ?? ''} rows={3} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <div className="border-t border-stone-200 pt-4">
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? 'Deleting…' : 'Delete Piece'}
        </Button>
      </div>
    </form>
  );
}
