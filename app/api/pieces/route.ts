import { NextRequest } from 'next/server';
import { createPiece } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, clay_type, glaze_combo, notes, thrown_date } = body;

    if (!clay_type?.trim()) {
      return Response.json({ error: 'clay_type is required' }, { status: 400 });
    }

    const piece = await createPiece({ name, clay_type, glaze_combo, notes, thrown_date });
    return Response.json({ piece }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to create piece' }, { status: 500 });
  }
}
