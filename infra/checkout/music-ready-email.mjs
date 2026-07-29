function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function singleLine(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function firstName(value) {
  const normalized = singleLine(value, 100);
  return normalized ? normalized.split(" ")[0].slice(0, 60) : "";
}

function normalizedTracks(tracks) {
  return (Array.isArray(tracks) ? tracks : [])
    .map((track, index) => ({
      title: singleLine(track?.title || `Versão ${index + 1}`, 160),
      imageUrl: safeHttpsUrl(track?.imageUrl),
      downloadUrl: safeHttpsUrl(track?.downloadUrl),
    }))
    .filter((track) => track.downloadUrl)
    .slice(0, 2);
}

export function musicReadyEmailSubject(tracks) {
  const [track] = normalizedTracks(tracks);
  return track?.title
    ? `Sua música “${track.title}” está pronta`
    : "Sua música está pronta";
}

export function buildMusicReadyEmail({
  recipientName,
  tracks,
  libraryUrl,
  logoUrl,
  supportUrl,
}) {
  const availableTracks = normalizedTracks(tracks);
  if (!availableTracks.length) {
    throw new Error("At least one downloadable track is required");
  }

  const safeLibraryUrl = safeHttpsUrl(libraryUrl);
  const safeLogoUrl = safeHttpsUrl(logoUrl);
  const safeSupportUrl = safeHttpsUrl(supportUrl);
  if (!safeLibraryUrl || !safeLogoUrl || !safeSupportUrl) {
    throw new Error("Email links must use HTTPS");
  }

  const greeting = firstName(recipientName);
  const trackCards = availableTracks.map((track, index) => `
              <tr>
                <td style="padding:${index === 0 ? "0" : "14px 0 0"};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #303832;border-radius:16px;background:#111512;">
                    <tr>
                      ${track.imageUrl ? `<td width="92" valign="middle" style="padding:14px 0 14px 14px;">
                        <img src="${escapeHtml(track.imageUrl)}" width="78" height="78" alt="" style="display:block;width:78px;height:78px;border:0;border-radius:10px;object-fit:cover;">
                      </td>` : ""}
                      <td valign="middle" style="padding:18px;">
                        <div style="margin:0 0 6px;color:#74ef86;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">VERSÃO ${index + 1}</div>
                        <div style="margin:0 0 14px;color:#ffffff;font-family:Arial,sans-serif;font-size:19px;font-weight:700;line-height:1.25;">${escapeHtml(track.title)}</div>
                        <a href="${escapeHtml(track.downloadUrl)}" style="display:inline-block;padding:11px 17px;border-radius:999px;background:#74ef86;color:#071009;font-family:Arial,sans-serif;font-size:12px;font-weight:800;text-decoration:none;">Ouvir ou baixar ↗</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join("");

  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(musicReadyEmailSubject(availableTracks))}</title>
  </head>
  <body style="margin:0;padding:0;background:#080b09;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Suas versões já podem ser ouvidas e baixadas.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080b09;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;border:1px solid #283029;border-radius:22px;background:#151a16;overflow:hidden;">
            <tr>
              <td style="padding:30px 34px 18px;">
                <img src="${escapeHtml(safeLogoUrl)}" width="230" alt="musicacom.ia" style="display:block;width:230px;max-width:78%;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td style="padding:14px 34px 8px;">
                <div style="margin:0 0 15px;color:#74ef86;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">MÚSICA FINALIZADA</div>
                <h1 style="margin:0;color:#ffffff;font-family:Arial,sans-serif;font-size:38px;line-height:1.05;letter-spacing:-1.2px;">${greeting ? `${escapeHtml(greeting)}, sua música` : "Sua música"} está pronta.</h1>
                <p style="margin:18px 0 0;color:#adb6af;font-family:Arial,sans-serif;font-size:15px;line-height:1.65;">Preparamos ${availableTracks.length > 1 ? "duas versões para você escolher" : "sua versão"}. Você já pode ouvir, baixar e continuar trabalhando na capa.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 34px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${trackCards}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 34px 34px;">
                <a href="${escapeHtml(safeLibraryUrl)}" style="display:block;padding:15px 20px;border:1px solid #4a564d;border-radius:999px;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-align:center;text-decoration:none;">Abrir minhas músicas</a>
                <p style="margin:18px 0 0;color:#778078;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;text-align:center;">Se o download não abrir, acesse sua biblioteca ou <a href="${escapeHtml(safeSupportUrl)}" style="color:#74ef86;text-decoration:underline;">fale com o suporte</a>.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px auto 0;max-width:580px;color:#687169;font-family:Arial,sans-serif;font-size:10px;line-height:1.6;text-align:center;">Mensagem automática enviada porque uma música foi criada na sua conta musicacom.ia.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const trackLines = availableTracks
    .map((track, index) => `Versão ${index + 1}: ${track.title}\nOuvir ou baixar: ${track.downloadUrl}`)
    .join("\n\n");
  const text = [
    greeting ? `${greeting}, sua música está pronta.` : "Sua música está pronta.",
    "",
    `Preparamos ${availableTracks.length > 1 ? "duas versões para você escolher" : "sua versão"}.`,
    "",
    trackLines,
    "",
    `Abrir minhas músicas: ${safeLibraryUrl}`,
    `Suporte: ${safeSupportUrl}`,
  ].join("\n");

  return {
    subject: musicReadyEmailSubject(availableTracks),
    html,
    text,
  };
}
