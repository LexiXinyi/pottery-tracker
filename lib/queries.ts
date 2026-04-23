import { getClient, getServiceClient, BUCKET, getPhotoUrl } from './supabase';
import { Piece, PieceWithDetails, PieceWithCover, Stage, Photo, StageName, STAGE_ORDER } from './types';

export async function getAllPieces(): Promise<PieceWithCover[]> {
  const db = getClient();
  const { data: pieces, error } = await db
    .from('pieces')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const { data: photos } = await db
    .from('photos')
    .select('piece_id, storage_path')
    .order('uploaded_at', { ascending: true });

  const coverByPiece: Record<string, string> = {};
  for (const photo of photos ?? []) {
    if (!coverByPiece[photo.piece_id]) {
      coverByPiece[photo.piece_id] = getPhotoUrl(photo.storage_path);
    }
  }

  return (pieces ?? []).map((p) => ({
    ...p,
    cover_url: coverByPiece[p.id] ?? null,
  }));
}

export async function getPieceById(id: string): Promise<PieceWithDetails | null> {
  const db = getClient();
  const [{ data: piece, error }, { data: stages }, { data: photos }] = await Promise.all([
    db.from('pieces').select('*').eq('id', id).single(),
    db.from('stages').select('*').eq('piece_id', id).order('stage_name'),
    db.from('photos').select('*').eq('piece_id', id).order('uploaded_at'),
  ]);

  if (error || !piece) return null;

  return {
    ...piece,
    stages: (stages ?? []) as Stage[],
    photos: (photos ?? []) as Photo[],
  };
}

export async function createPiece(data: {
  name?: string;
  clay_type: string;
  glaze_combo?: string;
  notes?: string;
  thrown_date?: string;
}): Promise<Piece> {
  const db = getClient();
  const { data: piece, error } = await db
    .from('pieces')
    .insert({
      name: data.name || null,
      clay_type: data.clay_type,
      glaze_combo: data.glaze_combo || null,
      notes: data.notes || null,
      current_stage: 'thrown',
    })
    .select()
    .single();

  if (error || !piece) throw error ?? new Error('Failed to create piece');

  const stageRows = STAGE_ORDER.map((stage) => ({
    piece_id: piece.id,
    stage_name: stage,
    stage_date: stage === 'thrown' ? (data.thrown_date ?? new Date().toISOString().split('T')[0]) : null,
    completed: stage === 'thrown',
  }));

  const { error: stageError } = await db.from('stages').insert(stageRows);
  if (stageError) throw stageError;

  return piece as Piece;
}

export async function updatePiece(
  id: string,
  data: Partial<Pick<Piece, 'name' | 'clay_type' | 'glaze_combo' | 'notes'>>
): Promise<Piece> {
  const { data: piece, error } = await getClient()
    .from('pieces')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error || !piece) throw error ?? new Error('Failed to update piece');
  return piece as Piece;
}

export async function deletePiece(id: string): Promise<void> {
  const service = getServiceClient();

  for (const stage of STAGE_ORDER) {
    const { data: stageFiles } = await service.storage.from(BUCKET).list(`${id}/${stage}`, { limit: 1000 });
    if (stageFiles && stageFiles.length > 0) {
      const paths = stageFiles.map((f) => `${id}/${stage}/${f.name}`);
      await service.storage.from(BUCKET).remove(paths);
    }
  }

  const { error } = await getClient().from('pieces').delete().eq('id', id);
  if (error) throw error;
}

export async function advanceStage(
  pieceId: string,
  stageName: StageName,
  stageDate: string
): Promise<void> {
  const db = getClient();
  await db
    .from('stages')
    .update({ completed: true, stage_date: stageDate })
    .eq('piece_id', pieceId)
    .eq('stage_name', stageName);

  await db
    .from('pieces')
    .update({ current_stage: stageName })
    .eq('id', pieceId);
}

export async function deletePhoto(id: string): Promise<void> {
  const db = getClient();
  const { data: photo, error } = await db
    .from('photos')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (error || !photo) throw error ?? new Error('Photo not found');

  const service = getServiceClient();
  await service.storage.from(BUCKET).remove([photo.storage_path]);
  await db.from('photos').delete().eq('id', id);
}
