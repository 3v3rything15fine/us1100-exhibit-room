import { getCurrentSessionId, loadSession, saveSession, aggregate } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const requested = url.searchParams.get("session");
  const id = requested || (await getCurrentSessionId(env.STATE));
  const doc = await loadSession(env.STATE, id);
  if (!requested) {
    // ensure the session doc exists so submissions have somewhere to land
    await saveSession(env.STATE, id, doc);
  }
  return new Response(
    JSON.stringify({ session: id, stage: doc.stage, aggregate: aggregate(doc) }),
    { headers: { "content-type": "application/json" } }
  );
}
