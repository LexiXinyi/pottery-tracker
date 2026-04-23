import { NextRequest } from 'next/server';
import { advanceStage } from '@/lib/queries';
import { StageName } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stage_name, stage_date } = await request.json();

    if (!stage_name || !stage_date) {
      return Response.json({ error: 'stage_name and stage_date are required' }, { status: 400 });
    }

    await advanceStage(id, stage_name as StageName, stage_date);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to advance stage' }, { status: 500 });
  }
}
