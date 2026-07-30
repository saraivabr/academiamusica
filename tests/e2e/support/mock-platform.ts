import type { Page, Route } from "@playwright/test";

const cognitoPattern = "https://cognito-idp.us-east-1.amazonaws.com/**";
const cognitoAuthPattern = "https://musicacom-ia.auth.us-east-1.amazoncognito.com/**";
const apiPattern = "https://fb9323mkb2.execute-api.us-east-1.amazonaws.com/**";

type MockOptions = {
  rejectFirstRegistration?: boolean;
  libraryTracks?: Array<{
    id: string;
    title: string;
    tags?: string;
    duration?: number;
    audioUrl?: string;
    imageUrl?: string;
  }>;
};

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function mockPlatform(page: Page, options: MockOptions = {}) {
  let registrationAttempts = 0;
  let businessSearchPolls = 0;

  await page.addInitScript(() => {
    document.cookie = "academia_access=v1.2000000000.e2e-user.signature; Path=/; SameSite=Strict";
  });

  await page.route(cognitoAuthPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/oauth2/authorize") {
      const redirectUri = url.searchParams.get("redirect_uri") || "";
      const state = url.searchParams.get("state") || "";
      await route.fulfill({
        status: 302,
        headers: {
          location: `${redirectUri}?code=e2e-google-code&state=${encodeURIComponent(state)}`,
        },
      });
      return;
    }

    if (url.pathname === "/oauth2/token" && request.method() === "POST") {
      await json(route, {
        id_token: "e2e-google-id-token",
        access_token: "e2e-google-access-token",
        expires_in: 3600,
        token_type: "Bearer",
      });
      return;
    }

    await json(route, { error: `Unexpected Cognito OAuth path: ${url.pathname}` }, 404);
  });

  await page.route(cognitoPattern, async (route) => {
    const target = route.request().headers()["x-amz-target"] || "";

    if (target.endsWith(".SignUp")) {
      registrationAttempts += 1;
      if (options.rejectFirstRegistration && registrationAttempts === 1) {
        await json(route, {
          __type: "InvalidPasswordException",
          message: "Password did not conform with policy.",
        }, 400);
        return;
      }
      await json(route, { UserConfirmed: false });
      return;
    }

    if (target.endsWith(".ConfirmSignUp")) {
      await json(route, {});
      return;
    }

    if (target.endsWith(".InitiateAuth")) {
      await json(route, {
        AuthenticationResult: {
          IdToken: "e2e-id-token",
        },
      });
      return;
    }

    if (target.endsWith(".ResendConfirmationCode")) {
      await json(route, {
        CodeDeliveryDetails: {
          DeliveryMedium: "EMAIL",
        },
      });
      return;
    }

    await json(route, {});
  });

  await page.route(apiPattern, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/v1/auth/exchange") {
      await json(route, {
        access: {
          token: "v1.2000000000.e2e-user.signature",
          expiresAt: "2033-05-18T03:33:20.000Z",
        },
      });
      return;
    }

    if (url.pathname === "/v1/music/availability") {
      await json(route, {
        available: true,
        offerVersion: "music_present_v1",
        remainingSongs: 20,
        dailyFreeAvailable: false,
      });
      return;
    }

    if (url.pathname === "/v1/music/library") {
      const tracks = options.libraryTracks ?? [];
      await json(route, {
        offerVersion: "music_present_v1",
        remainingSongs: 20,
        dailyFreeAvailable: false,
        generations: tracks.length
          ? [{
              taskId: "e2e_library",
              status: "SUCCESS",
              createdAt: "2026-07-28T12:00:00.000Z",
              tracks: tracks.map((track) => ({
                streamAudioUrl: "",
                imageUrl: "",
                ...track,
              })),
            }]
          : [],
      });
      return;
    }

    if (url.pathname === "/v1/prospects/search" && request.method() === "POST") {
      await json(route, {
        searchId: "e2eBusinessRun01",
        status: "READY",
        query: "cafeterias",
        location: "Salvador, BA",
      }, 202);
      return;
    }

    if (url.pathname === "/v1/prospects/search/e2eBusinessRun01") {
      businessSearchPolls += 1;
      await json(route, businessSearchPolls > 0
        ? {
            searchId: "e2eBusinessRun01",
            status: "SUCCEEDED",
            prospects: [{
              id: "ChIJ-e2e",
              name: "Café da Praça",
              category: "Cafeteria",
              address: "Salvador, BA",
              phone: "(71) 99999-0000",
              website: "https://cafe.example.test/",
              mapsUrl: "https://maps.google.com/example",
              imageUrl: "",
              rating: 4.8,
              reviewsCount: 234,
            }],
          }
        : {
            searchId: "e2eBusinessRun01",
            status: "RUNNING",
          });
      return;
    }

    if (url.pathname === "/v1/music/generations" && request.method() === "POST") {
      await json(route, {
        taskId: "e2e_generation",
        status: "PENDING",
        remainingSongs: 18,
        dailyFreeUsed: false,
      });
      return;
    }

    if (url.pathname === "/v1/music/generations/e2e_generation") {
      await json(route, {
        status: "SUCCESS",
        remainingSongs: 18,
        dailyFreeAvailable: false,
        tracks: [
          {
            id: "e2e_track",
            title: "Raiz que me guia",
            tags: "sertanejo",
            duration: 186,
            audioUrl: "https://media.example.test/e2e-track.mp3",
            streamAudioUrl: "",
            imageUrl: "",
          },
        ],
      });
      return;
    }

    // Analytics is intentionally absorbed so E2E runs never pollute production data.
    if (url.pathname === "/v1/events") {
      await json(route, { ok: true });
      return;
    }

    await json(route, { error: `Unexpected mocked API path: ${url.pathname}` }, 404);
  });
}
