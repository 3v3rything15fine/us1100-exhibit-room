import { getCurrentSessionId, loadSession, aggregate } from "./_shared.js";

// Read-only: never writes to KV. Polled every few seconds by every open
// tab, so a write here would burn the daily KV write quota almost
// immediately. advance.js and submit.js create the session doc on their
// own first write — nothing here needs to pre-create it.
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("session");
  const id = requested || (await getCurrentSessionId(env.STATE));
  const doc = await loadSession(env.STATE, id);
  return new Response(
    JSON.stringify({ session: id, stage: doc.stage, aggregate: aggregate(doc) }),
    { headers: { "content-type": "application/json" } }
  );
}
