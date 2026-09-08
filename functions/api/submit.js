import { getCurrentSessionId, loadSession, saveSession, aggregate } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), { status: 400 });
  }

  if (!body || typeof body.clientId !== "string" || !body.clientId) {
    return new Response(JSON.stringify({ error: "missing_client_id" }), { status: 400 });
  }

  const id = body.session || (await getCurrentSessionId(env.STATE));
  const doc = await loadSession(env.STATE, id);

  doc.submissions[body.clientId] = {
    assumes: Number(body.assumes) || 0,
    teaches: Number(body.teaches) || 0,
    unsorted: Number(body.unsorted) || 0,
    ts: Date.now(),
  };

  await saveSession(env.STATE, id, doc);

  return new Response(
    JSON.stringify({ session: id, stage: doc.stage, aggregate: aggregate(doc) }),
    { headers: { "content-type": "application/json" } }
  );
}
