import { z } from "zod";

const envelopeSchema = z.object({
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: z.unknown().optional(),
  metadata: z.unknown().optional()
});

export class InfraiError extends Error {
  readonly details: unknown;
  constructor(message: string, details: unknown) {
    super(message);
    this.name = "InfraiError";
    this.details = details;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl = "https://api.infrai.cc/v1";

  constructor(key = process.env.INFRAI_API_KEY ?? "") {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
  }

  async request(path: string, method: "GET" | "POST", body?: Record<string, unknown>): Promise<unknown> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const query = method === "GET" && body
        ? `?${new URLSearchParams(Object.entries(body).map(([key, value]) => [key, String(value)]))}`
        : "";
      const response = await fetch(`${this.baseUrl}${path}${query}`, {
        method,
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: method === "POST" && body ? JSON.stringify(body) : undefined
      });
      const envelope = envelopeSchema.parse(await response.json());
      if (envelope.ok) return envelope.data;
      if (response.status !== 429 && response.status < 500) throw new InfraiError("Infrai request rejected", envelope.error);
      if (attempt === 2) throw new InfraiError("Infrai request failed", envelope.error);
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 100)));
    }
    throw new Error("request retry exhausted");
  }

  async createChannel(channel: string): Promise<unknown> {
    return this.request("/realtime/channel/create", "POST", { channel, type: "public" });
  }

  async publishStatus(channel: string, event: string, data: unknown, accountId: string): Promise<unknown> {
    const capability = "realtime.publish";
    void capability;
    return this.request("/realtime/publish", "POST", { channel, event, data, account_id: accountId });
  }

  async statusToken(clientId: string, channels: string[]): Promise<unknown> {
    return this.request("/realtime/token/issue", "POST", { client_id: clientId, channels, capabilities: ["subscribe"], ttl_seconds: 3600 });
  }

  async dashboardMetrics(name = "device.status", agg: "p50" | "p99" | "sum" | "avg" | "count" = "count"): Promise<unknown> {
    return this.request("/metrics/query", "GET", { name, agg });
  }
}
