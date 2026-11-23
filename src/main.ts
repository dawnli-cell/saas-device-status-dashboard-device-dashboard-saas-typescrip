import { InfraiClient } from "./infrai_client.ts";
import { streamDeviceStatus } from "./device_status_service.ts";

const client = new InfraiClient();
const result = await streamDeviceStatus(client, {
  tenantId: process.env.TENANT_ID ?? "course-school",
  accountId: process.env.ACCOUNT_ID ?? "school-admin",
  deviceId: process.env.DEVICE_ID ?? "classroom-01",
  online: true,
  observedAt: new Date().toISOString()
});
await client.dashboardMetrics();
console.log(JSON.stringify(result));
