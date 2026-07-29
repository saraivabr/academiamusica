import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const backendSource = await readFile(
  new URL("../infra/checkout/index.mjs", import.meta.url),
  "utf8",
);
const deploySource = await readFile(
  new URL("../infra/deploy-checkout.sh", import.meta.url),
  "utf8",
);

test("successful music generation sends one claimed notification", () => {
  assert.match(backendSource, /emailNotificationRequested: \{ BOOL: true \}/);
  assert.match(
    backendSource,
    /task\?\.emailNotificationRequested\?\.BOOL === true/,
  );
  assert.match(backendSource, /sendMusicReadyEmail\(order, taskId, tracks\)/);
  assert.match(
    backendSource,
    /attribute_not_exists\(emailNotificationSentAt\).*emailNotificationClaimExpiresAt < :nowEpoch/,
  );
  assert.match(backendSource, /emailNotificationStatus = :sent/);
  assert.match(backendSource, /music_ready_email_sent_/);
});

test("email download links are signed, expiring, and refreshed before redirect", () => {
  assert.match(backendSource, /music-download\.v1\.\$\{taskId\}\.\$\{trackId\}\.\$\{expires\}/);
  assert.match(backendSource, /MUSIC_DOWNLOAD_LINK_DAYS = 7/);
  assert.match(backendSource, /verifyMusicDownloadSignature/);
  assert.match(backendSource, /await reconcileSunoTask\(taskId, task, order\)/);
  assert.match(backendSource, /path\.startsWith\("\/v1\/music\/download\/"\)/);
});

test("AWS deployment packages the template and grants only verified sender identities", () => {
  assert.match(deploySource, /cp infra\/checkout\/music-ready-email\.mjs/);
  assert.match(deploySource, /"Action": "ses:SendEmail"/);
  assert.match(deploySource, /identity\/escreve\.ai/);
  assert.match(deploySource, /identity\/musicacom\.ia\.br/);
  assert.match(deploySource, /EMAIL_FROM_ADDRESS=\$\{MUSIC_EMAIL_FROM_ADDRESS\}/);
});
