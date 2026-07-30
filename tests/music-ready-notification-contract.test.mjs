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
  assert.match(
    backendSource,
    /recordSuccessfulSunoTask\(order, taskId, item, tracks\.slice\(0, trackLimit\)\)/,
  );
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
  assert.match(deploySource, /get-email-identity/);
  assert.match(deploySource, /VerifiedForSendingStatus/);
  assert.match(deploySource, /"Action": "ses:SendEmail"/);
  assert.match(
    deploySource,
    /"Action": "dynamodb:DeleteItem",\s+"Resource": "arn:aws:dynamodb:\$\{AWS_REGION\}:\$\{ACCOUNT_ID\}:table\/\$\{EVENTS_TABLE_NAME\}"/,
  );
  assert.match(deploySource, /identity\/\$\{MUSIC_EMAIL_IDENTITY\}/);
  assert.doesNotMatch(deploySource, /identity\/musicacom\.ia\.br/);
  assert.match(
    deploySource,
    /configuration-set\/\$\{MUSIC_EMAIL_CONFIGURATION_SET\}/,
  );
  assert.match(
    deploySource,
    /identity\/\$\{MUSIC_EMAIL_SANDBOX_RECIPIENT\}/,
  );
  assert.match(deploySource, /SES_REGION=\$\{SES_REGION\}/);
  assert.match(deploySource, /EMAIL_FROM_ADDRESS=\$\{MUSIC_EMAIL_FROM_ADDRESS\}/);
  assert.match(
    deploySource,
    /EMAIL_REPLY_TO_ADDRESS=\$\{MUSIC_EMAIL_REPLY_TO_ADDRESS\}/,
  );
  assert.match(
    deploySource,
    /EMAIL_CONFIGURATION_SET=\$\{MUSIC_EMAIL_CONFIGURATION_SET\}/,
  );
  assert.match(deploySource, /get-configuration-set-event-destinations/);
  assert.match(deploySource, /"MatchingEventTypes":\["SEND","DELIVERY"/);
  assert.match(backendSource, /ConfigurationSetName: EMAIL_CONFIGURATION_SET/);
  assert.match(backendSource, /event: "music_ready_email_sent"/);
});
