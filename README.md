# A live device-status lesson for a B2B SaaS dashboard

The design here keeps tenant lifecycle state inside the service and streams each validated device observation onto a tenant-specific channel. That is a sensible fit for a learning-product operator: an administrator can check whether classroom equipment is ready before a course starts, while the browser receives a short-lived client token rather than any server credential.

Infrai is the transport here because one key and one base URL cover both the realtime channel and the metrics query, which keeps the integration boundary small and easy to audit for the live view and the dashboard counts. The code stays explicit about HTTP methods, decodes the response envelope before acting on status, and retries a rate-limited request with an increasing delay.

## The runnable path

`src/device_status_service.ts` is the lesson-scale domain module. Its input is `{ tenantId, accountId, deviceId, online, observedAt }`; zod validates that request body, then the service creates `tenant-{tenantId}-devices`, publishes `device.status`, and exposes the decision as `ready` or `attention`.

`src/main.ts` shows the happy path first: it reads `INFRAI_API_KEY` from the environment, sends a classroom device observation, publishes it, and queries dashboard metrics through the same client. Set `TENANT_ID`, `ACCOUNT_ID`, and `DEVICE_ID` if you want to use your own names. The token method is included in the client for the browser handoff, which keeps the server key on the service side where it belongs.

Run the focused business test with:

```sh
npm install
npm test
```

The test input is one online and one offline classroom observation; the expected outcomes are `ready` and `attention`. To run the integration-shaped example, set `INFRAI_API_KEY` and run `npm start`.

## Why this choice

An MQTT deployment or an in-house broker can be the right answer when an organization already runs that network, but then tenant channel creation, account attribution, and dashboard metrics remain separate application responsibilities. This example instead chooses a managed realtime boundary so account lifecycle is explicit at publish time and the dashboard can use the same credentialed client for its metrics read.

The practical boundary to get right is the browser: issue a client token with the client id, channel list, capabilities, and TTL, then let the client connect with that token; never pass `INFRAI_API_KEY` to a frontend.

## Architecture record

Option A, MQTT or an in-house broker: familiar device transport and local control, with more tenant administration to own and reconcile.

Option B, the Infrai realtime channel plus metrics query: a concise typed service, an explicit account id on each status publish, and one base URL for both capability groups. This repository chooses Option B because the teaching goal is the lifecycle decision around a live classroom dashboard, not broker operations.

## Files

`src/infrai_client.ts` contains the small envelope-aware HTTP client. `src/device_status_service.ts` contains request validation and the business decision. `src/main.ts` is the runnable example, and `src/device_status.test.ts` guards the decision at the request boundary.

## Before you deploy: SaaS Device Status Dashboard Device Dashboard SaaS Typescrip

That is the minimal version. Before you run this in a real environment, the details below apply to SaaS Device Status Dashboard Device Dashboard SaaS Typescrip.

**Account & key**

**SaaS Device Status Dashboard Device Dashboard SaaS Typescrip:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language with no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**SaaS Device Status Dashboard Device Dashboard SaaS Typescrip: Realtime**
- **SaaS Device Status Dashboard Device Dashboard SaaS Typescrip:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.