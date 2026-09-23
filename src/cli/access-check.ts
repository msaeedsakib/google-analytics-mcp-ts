import { createClients } from "../clients";
import type { ServiceAccount } from "../credentials";

export type VisibleProperty = { property: string; displayName: string; account: string };

export type AccessResult =
  | { status: "ok"; properties: VisibleProperty[] }
  | { status: "api-disabled"; api: string; url: string }
  | { status: "no-properties" }
  | { status: "error"; message: string };

const API_LABELS: Record<string, string> = {
  "analyticsadmin.googleapis.com": "Google Analytics Admin API",
  "analyticsdata.googleapis.com": "Google Analytics Data API",
};

export function classifyError(error: unknown, api: string, projectId: string): AccessResult {
  const message = error instanceof Error ? error.message : String(error);
  if (/SERVICE_DISABLED|has not been used in project|it is disabled/i.test(message)) {
    return {
      status: "api-disabled",
      api: API_LABELS[api] ?? api,
      url: `https://console.cloud.google.com/apis/library/${api}?project=${projectId}`,
    };
  }
  if (/UNAUTHENTICATED|invalid_grant|invalid_client|account not found/i.test(message)) {
    return { status: "error", message: "Google rejected this key. It may have been deleted or disabled; create a new key." };
  }
  return { status: "error", message };
}

export async function checkAccess(keyFilename: string, account: ServiceAccount): Promise<AccessResult> {
  const clients = createClients(keyFilename);
  try {
    const properties: VisibleProperty[] = [];
    try {
      for await (const summary of clients.adminBeta.listAccountSummariesAsync({}, { autoPaginate: false })) {
        for (const property of summary.propertySummaries ?? []) {
          properties.push({
            property: property.property ?? "",
            displayName: property.displayName ?? "",
            account: summary.displayName ?? "",
          });
        }
      }
    } catch (error) {
      return classifyError(error, "analyticsadmin.googleapis.com", account.project_id);
    }
    const first = properties[0];
    if (!first) return { status: "no-properties" };
    try {
      await clients.dataBeta.getMetadata({ name: `${first.property}/metadata` });
    } catch (error) {
      return classifyError(error, "analyticsdata.googleapis.com", account.project_id);
    }
    return { status: "ok", properties };
  } finally {
    await Promise.allSettled(Object.values(clients).map((client) => client.close()));
  }
}
