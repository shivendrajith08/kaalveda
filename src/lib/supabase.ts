import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase is OPTIONAL. When the env vars are absent, `supabase` is null and
 * the app falls back to localStorage (see `useBookmarks` / `useAuth`). This
 * lets KaalVeda run with zero backend setup.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

export interface BookmarkRow {
  article_id: string
  created_at?: string
}

/** Fetch bookmarks for the signed-in user (Supabase mode only). */
export async function fetchRemoteBookmarks(userId: string): Promise<string[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('bookmarks')
    .select('article_id')
    .eq('user_id', userId)
  if (error || !data) return []
  return data.map((row) => (row as BookmarkRow).article_id)
}

export async function addRemoteBookmark(userId: string, articleId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('bookmarks').upsert(
    { user_id: userId, article_id: articleId },
    { onConflict: 'user_id,article_id' },
  )
}

export async function removeRemoteBookmark(userId: string, articleId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('bookmarks').delete().eq('user_id', userId).eq('article_id', articleId)
}
