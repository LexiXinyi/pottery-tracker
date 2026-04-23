'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewPieceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim() || undefined,
      clay_type: (form.elements.namedItem('clay_type') as HTMLInputElement).value.trim(),
      glaze_combo: (form.elements.namedItem('glaze_combo') as HTMLInputElement).value.trim() || undefined,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim() || undefined,
      thrown_date: (form.elements.namedItem('thrown_date') as HTMLInputElement).value || undefined,
    };

    try {
      const res = await fetch('/api/pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create piece');
      const { piece } = await res.json();
      router.push(`/pieces/${piece.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-stone-200 p-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name <span className="text-stone-400 font-normal">(optional)</span></Label>
        <Input id="name" name="name" placeholder="e.g. Bowl #3, Yunomi" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clay_type">Clay Type <span className="text-red-400">*</span></Label>
        <Input
          id="clay_type"
          name="clay_type"
          required
          placeholder="e.g. Stoneware, Porcelain, B-mix 5"
          list="clay-suggestions"
        />
        <datalist id="clay-suggestions">
          <option value="Stoneware" />
          <option value="Porcelain" />
          <option value="B-mix 5" />
          <option value="Raku" />
          <option value="Earthenware" />
          <option value="Terracotta" />
        </datalist>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="glaze_combo">Glaze Combination <span className="text-stone-400 font-normal">(optional)</span></Label>
        <Input id="glaze_combo" name="glaze_combo" placeholder="e.g. Celadon over Shino" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="thrown_date">Date Thrown</Label>
        <Input
          id="thrown_date"
          name="thrown_date"
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes <span className="text-stone-400 font-normal">(optional)</span></Label>
        <Textarea id="notes" name="notes" placeholder="Any notes about this piece..." rows={3} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Piece'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
