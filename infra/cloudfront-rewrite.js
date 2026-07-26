var crypto = require("crypto");
var ACCESS_SECRET = "__ACCESS_SECRET__";
var PROTECTED_PREFIXES = ["/academia", "/biblioteca", "/comunidade"];

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
