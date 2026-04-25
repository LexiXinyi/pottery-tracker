import { NextRequest } from 'next/server';
import { createPiece } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, clay_type, glaze_combo, notes, starting_stage, stage_date } = body;

    const piece = await createPiece({ name, clay_type: (clay_type ?? '').trim(), glaze_combo, notes, starting_stage, stage_date });
    return Response.json({ piece }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to create piece' }, { status: 500 });
  }
}
