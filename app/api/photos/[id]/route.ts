import { NextRequest } from 'next/server';
import { deletePhoto } from '@/lib/queries';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePhoto(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
