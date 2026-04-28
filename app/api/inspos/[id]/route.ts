import { NextRequest } from 'next/server';
import { deleteInspo, updateInspoStatus } from '@/lib/queries';
import { INSPO_STATUS_ORDER, InspoStatus } from '@/lib/types';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteInspo(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to delete inspo' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body?.status as InspoStatus;
    if (!INSPO_STATUS_ORDER.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    await updateInspoStatus(id, status);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update inspo' }, { status: 500 });
  }
}
