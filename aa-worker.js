// Kinfolk ↔ Artificial Analysis relay. Deploy as a Cloudflare Worker (free).
// Set a secret named AA_KEY with your Artificial Analysis API key.
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "GET") return new Response("GET only", { status: 405, headers: cors });
    const upstream = await fetch("https://artificialanalysis.ai/api/v2/data/llms/models", {
      headers: { "x-api-key": env.AA_KEY },
      cf: { cacheTtl: 21600, cacheEverything: true },
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=21600" },
    });
  },
};
