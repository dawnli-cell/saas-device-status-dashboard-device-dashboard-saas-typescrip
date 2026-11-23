import test from "node:test";
import assert from "node:assert/strict";
import { lifecycleDecision, deviceStatusSchema } from "./device_status_service.ts";

test("an online classroom device is ready and an offline one needs attention", () => {
  const online = deviceStatusSchema.parse({ tenantId: "school", accountId: "admin", deviceId: "lab-1", online: true, observedAt: "2026-01-01T00:00:00.000Z" });
  const offline = { ...online, online: false };
  assert.equal(lifecycleDecision(online), "ready");
  assert.equal(lifecycleDecision(offline), "attention");
});
