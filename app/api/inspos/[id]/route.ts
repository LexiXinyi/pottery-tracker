import { NextRequest } from 'next/server';
import { deleteInspo } from '@/lib/queries';

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
