const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function getSupabaseConfig() {
  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { publishableKey, supabaseUrl };
}

type QueryValue = string | number | boolean;

export async function readFromSupabase<T>(
  path: string,
  params: Record<string, QueryValue> = {},
): Promise<T> {
  const config = getSupabaseConfig();
  const url = new URL(`/rest/v1/${path}`, config.supabaseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase read failed: ${response.status} ${body}`);
  }

  return response.json() as Promise<T>;
}
