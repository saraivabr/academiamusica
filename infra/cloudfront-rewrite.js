var crypto = require("crypto");
var ACCESS_SECRET = "__ACCESS_SECRET__";
var PROTECTED_PREFIXES = ["/biblioteca"];
// A Academia saiu do produto e /biblioteca assumiu o papel de home do estúdio.
// Quem guardou um link antigo cairia em 404, então mandamos para a home nova.
var RETIRED_HOME = "/academia";
var CURRENT_HOME = "/biblioteca/";

function isRetiredHome(uri) {
  // A barra é obrigatória no prefixo: sem ela, /academia-musica-ia-trap-jingle.mp3
  // (o áudio de demonstração da home) também seria redirecionado.
  return uri === RETIRED_HOME || uri.indexOf(RETIRED_HOME + "/") === 0;
}

function isProtected(uri) {
  for (var index = 0; index < PROTECTED_PREFIXES.length; index += 1) {
    var prefix = PROTECTED_PREFIXES[index];
    if (uri === prefix || uri.indexOf(prefix + "/") === 0) return true;
  }
  return false;
}

function hasValidAccess(request) {
  var cookie = request.cookies && request.cookies.academia_access;
  if (!cookie || !cookie.value) return false;
  var parts = cookie.value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  var expiresAt = parseInt(parts[1], 10);
  var orderId = parts[2];
  if (!expiresAt || expiresAt < Math.floor(Date.now() / 1000)) return false;
  if (!/^ami_[a-f0-9]{28}$/.test(orderId)) return false;
  var payload = parts[0] + "." + parts[1] + "." + orderId;
  var expected = crypto.createHmac("sha256", ACCESS_SECRET).update(payload).digest("hex");
  return expected === parts[3];
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Vem antes da proteção: sem cookie, o próprio /biblioteca já manda ao login,
  // então o membro chega ao destino certo em vez de a um 404.
  if (isRetiredHome(uri)) {
    return {
      statusCode: 302,
      statusDescription: "Found",
      headers: {
        location: {
          value: CURRENT_HOME
        },
        "cache-control": {
          value: "public,max-age=3600"
        }
      }
    };
  }

  if (isProtected(uri) && !hasValidAccess(request)) {
    return {
      statusCode: 302,
      statusDescription: "Found",
      headers: {
        location: {
          value: "/login/?next=" + encodeURIComponent(uri)
        },
        "cache-control": {
          value: "no-store"
        }
      }
    };
  }

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (!uri.split("/").pop().includes(".")) {
    request.uri = uri + "/index.html";
  }

  return request;
}
