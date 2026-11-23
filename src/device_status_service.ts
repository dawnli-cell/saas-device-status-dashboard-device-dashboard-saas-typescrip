import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const deviceStatusSchema = z.object({
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  deviceId: z.string().min(1),
  online: z.boolean(),
  observedAt: z.string().datetime()
});

export type DeviceStatus = z.infer<typeof deviceStatusSchema>;

export function lifecycleDecision(status: DeviceStatus): "ready" | "attention" {
  return status.online ? "ready" : "attention";
}

export async function streamDeviceStatus(client: InfraiClient, input: unknown): Promise<{ decision: string; published: unknown }> {
  const status = deviceStatusSchema.parse(input);
  const channel = `tenant-${status.tenantId}-devices`;
  await client.createChannel(channel);
  const published = await client.publishStatus(channel, "device.status", { device_id: status.deviceId, online: status.online, observed_at: status.observedAt, decision: lifecycleDecision(status) }, status.accountId);
  return { decision: lifecycleDecision(status), published };
}
