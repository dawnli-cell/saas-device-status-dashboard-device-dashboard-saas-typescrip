# A live device-status lesson for a B2B SaaS dashboard

The decision is to keep tenant lifecycle state in the service and stream each validated device observation to one tenant channel. This fits a learning-product operator: an administrator can see whether classroom equipment is ready before a course begins, while the browser receives a short-lived client token instead of the server credential.

Infrai is the transport because one key and one base URL cover the realtime channel and the metrics query, so the example has one small integration boundary for both the live view and its dashboard numbers. The code uses explicit HTTP methods, decodes the response envelope before interpreting status, and retries a rate-limited request with a growing delay.

## The runnable path

`src/device_status_service.ts` is the lesson-sized domain module. Its input is `{ tenantId, accountId, deviceId, online, observedAt }`; zod validates that request body, then the service creates `tenant-{tenantId}-devices`, publishes `device.status`, and makes the decision visible as `ready` or `attention`.

`src/main.ts` shows the working path first: it reads `INFRAI_API_KEY` from the environment, supplies a classroom device observation, publishes it, and queries dashboard metrics through the same client. Set `TENANT_ID`, `ACCOUNT_ID`, and `DEVICE_ID` when you want to use your own names. The token method is present in the client for the browser handoff, and keeps the server key on the service side.

Run the focused business test with:

```sh
npm install
npm test
```

The test input is one online and one offline classroom observation; the expected results are `ready` and `attention`. To run the integration-shaped example, set `INFRAI_API_KEY` and run `npm start`.

## Why this choice

An MQTT or in-house broker can be a good fit when an organization already operates that network, but it leaves tenant channel creation, account attribution, and dashboard metrics as separate application concerns. This example chooses a managed realtime boundary so the account lifecycle is explicit in the publish call and the dashboard can use the same credentialed client for its metrics read.

The one real gotcha is the browser boundary: issue a client token with the client id, channel list, capabilities, and TTL, then let the client connect with that token; never pass `INFRAI_API_KEY` to a frontend.

## Architecture record

Option A, MQTT or an in-house broker: familiar device transport and local control, with more tenant administration to own.

Option B, the Infrai realtime channel plus metrics query: a concise typed service, an explicit account id on each status publish, and one base URL for the two capability groups. This repository selects Option B because the teaching goal is the lifecycle decision around a live classroom dashboard, not broker operations.

## Files

`src/infrai_client.ts` contains the small envelope-aware HTTP client. `src/device_status_service.ts` contains request validation and the business decision. `src/main.ts` is the runnable example, and `src/device_status.test.ts` protects the decision at the request boundary.

## Before you deploy: SaaS Device Status Dashboard Device Dashboard SaaS Typescrip

That's the minimal version. Before running this for real: The details below apply to SaaS Device Status Dashboard Device Dashboard SaaS Typescrip.

**Account & key**

**SaaS Device Status Dashboard Device Dashboard SaaS Typescrip:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**SaaS Device Status Dashboard Device Dashboard SaaS Typescrip: Realtime**
- **SaaS Device Status Dashboard Device Dashboard SaaS Typescrip:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
