import { STAGES, getCurrentSessionId, loadSession, saveSession, aggregate, todaySessionId } from "./_shared.js";

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), { status: 400 });
  }

  if (!body || body.token !== env.PRESENTER_TOKEN) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  if (body.action === "new_session") {
    const id = todaySessionId();
    const doc = { stage: "warmup", submissions: {} };
    await saveSession(env.STATE, id, doc);
    await env.STATE.put("current_session", id);
    return new Response(
      JSON.stringify({ session: id, stage: doc.stage, aggregate: aggregate(doc) }),
      { headers: { "content-type": "application/json" } }
    );
  }

  if (!STAGES.includes(body.stage)) {
    return new Response(JSON.stringify({ error: "bad_stage" }), { status: 400 });
  }

  const id = body.session || (await getCurrentSessionId(env.STATE));
  const doc = await loadSession(env.STATE, id);
  doc.stage = body.stage;
  await saveSession(env.STATE, id, doc);

  return new Response(
    JSON.stringify({ session: id, stage: doc.stage, aggregate: aggregate(doc) }),
    { headers: { "content-type": "application/json" } }
  );
}
