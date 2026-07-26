const MOTOR_RESPONSES_URL = "https://motor.empresa.ia.br/v1/responses";
const MAX_REQUEST_BYTES = 10 * 1024 * 1024;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

const worker = {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json(405, { error: "Method not allowed" });
    }
    if (
      !env.PROXY_SHARED_KEY
      || request.headers.get("x-academia-proxy-key") !== env.PROXY_SHARED_KEY
    ) {
      return json(401, { error: "Unauthorized" });
    }
    const declaredLength = Number(request.headers.get("content-length") || "0");
    if (declaredLength > MAX_REQUEST_BYTES) {
      return json(413, { error: "Image payload is too large" });
    }
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_REQUEST_BYTES) {
      return json(413, { error: "Image payload is too large" });
    }

    const upstream = await fetch(MOTOR_RESPONSES_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.IMAGE_API_KEY}`,
        "content-type": "application/json",
        accept: "text/event-stream",
        "user-agent": "AcademiaMusica/1.0",
      },
      body,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "text/event-stream",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  },
};

export default worker;
