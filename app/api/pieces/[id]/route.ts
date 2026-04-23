import { NextRequest } from 'next/server';
import { updatePiece, deletePiece } from '@/lib/queries';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const piece = await updatePiece(id, body);
    return Response.json({ piece });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update piece' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePiece(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to delete piece' }, { status: 500 });
  }
}
