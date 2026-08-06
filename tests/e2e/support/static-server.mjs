import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

// Serve `out/` com a mesma regra da CloudFront Function de produção:
// diretório resolve para index.html e caminho sem extensão ganha /index.html.
const outDir = path.resolve(import.meta.dirname, "../../../out");
const port = Number(process.env.PORT ?? 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function resolveUri(uri) {
  if (uri.endsWith("/")) return `${uri}index.html`;
  if (!uri.split("/").pop().includes(".")) return `${uri}/index.html`;
  return uri;
}

async function readable(file) {
  try {
    return (await stat(file)).isFile() ? file : null;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const uri = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const candidate = path.join(outDir, resolveUri(uri));
  // Impede que um caminho traiçoeiro escape de out/.
  const target = candidate.startsWith(outDir) ? await readable(candidate) : null;
  const file = target ?? (await readable(path.join(outDir, "404.html")));

  if (!file) {
    response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  response.writeHead(target ? 200 : 404, {
    "content-type": types[path.extname(file)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`static out/ on http://127.0.0.1:${port}`);
});
