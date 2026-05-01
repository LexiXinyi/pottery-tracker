import { NextRequest } from 'next/server';
import { advanceStage, uncompleteStage } from '@/lib/queries';
import { StageName } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stage_name, stage_date, completed } = await request.json();

    if (!stage_name) {
      return Response.json({ error: 'stage_name is required' }, { status: 400 });
    }

    if (completed === false) {
      await uncompleteStage(id, stage_name as StageName);
    } else {
      if (!stage_date) {
        return Response.json({ error: 'stage_date is required' }, { status: 400 });
      }
      await advanceStage(id, stage_name as StageName, stage_date);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update stage' }, { status: 500 });
  }
}
