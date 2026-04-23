import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const BUCKET = 'pottery-photos';

let _client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _client = createClient(url, key);
  }
  return _client;
}

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = getClient().storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
