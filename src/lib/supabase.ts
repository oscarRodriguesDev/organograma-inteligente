import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://tdsfwchqeezrdlfncknk.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? ''

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

export const BUCKET_FOTOS = 'profile-photo'

export function getFotoUrl(fileName: string): string {
  const { data } = supabaseAdmin.storage.from(BUCKET_FOTOS).getPublicUrl(fileName)
  return data.publicUrl
}
