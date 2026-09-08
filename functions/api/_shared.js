// One exhibit visible at a time: "warmup" shows none (presenter is
// narrating), then "a"/"b"/"c" each show exactly that exhibit.
export const STAGES = ["warmup", "a", "b", "c"];

export function todaySessionId() {
  return new Date().toISOString().slice(0, 10);
}

export async function getCurrentSessionId(kv) {
  const existing = await kv.get("current_session");
  if (existing) return existing;
  const id = todaySessionId();
  await kv.put("current_session", id);
  return id;
}

export async function loadSession(kv, id) {
  const raw = await kv.get(`session:${id}`);
  if (raw) return JSON.parse(raw);
  return { stage: "warmup", submissions: {} };
}

export async function saveSession(kv, id, doc) {
  await kv.put(`session:${id}`, JSON.stringify(doc));
}

export function aggregate(doc) {
  let assumes = 0, teaches = 0, unsorted = 0, n = 0;
  for (const key in doc.submissions) {
    const s = doc.submissions[key];
    assumes += s.assumes || 0;
    teaches += s.teaches || 0;
    unsorted += s.unsorted || 0;
    n++;
  }
  return { assumes, teaches, unsorted, n };
}

export function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init && init.headers) },
  });
}
