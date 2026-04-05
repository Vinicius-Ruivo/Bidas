/** Evita criar cliente com placeholders do .env.example ou URLs inválidas (quebrava a app no cliente). */
export function hasSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return false;
  if (url === "undefined" || key === "undefined") return false;
  if (/YOUR_PROJECT|example\.com|localhost:99999/i.test(url)) return false;
  if (/YOUR_PUBLIC|changeme|placeholder/i.test(key)) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
  } catch {
    return false;
  }
  return true;
}
