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
type JsonBody = Record<string, string | number | boolean | null>;

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

export async function writeToSupabase<T>(
  path: string,
  {
    body,
    method,
    params = {},
  }: {
    body: JsonBody;
    method: "POST" | "PATCH";
    params?: Record<string, QueryValue>;
  },
): Promise<T> {
  const config = getSupabaseConfig();
  const url = new URL(`/rest/v1/${path}`, config.supabaseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    method,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase write failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}
