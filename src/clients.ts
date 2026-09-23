import { v1alpha as adminAlpha, v1beta as adminBeta } from "@google-analytics/admin";
import { v1alpha as dataAlpha, v1beta as dataBeta } from "@google-analytics/data";
import { existsSync } from "node:fs";
import { keyPath, PACKAGE_NAME } from "./paths";

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"];

export type Clients = {
  adminBeta: adminBeta.AnalyticsAdminServiceClient;
  adminAlpha: adminAlpha.AnalyticsAdminServiceClient;
  dataBeta: dataBeta.BetaAnalyticsDataClient;
  dataAlpha: dataAlpha.AlphaAnalyticsDataClient;
};

export function createClients(keyFilename: string): Clients {
  const options = { keyFilename, scopes: SCOPES };
  return {
    adminBeta: new adminBeta.AnalyticsAdminServiceClient(options),
    adminAlpha: new adminAlpha.AnalyticsAdminServiceClient(options),
    dataBeta: new dataBeta.BetaAnalyticsDataClient(options),
    dataAlpha: new dataAlpha.AlphaAnalyticsDataClient(options),
  };
}

export function lazyClients(): () => Clients {
  let clients: Clients | undefined;
  return () => {
    if (clients) return clients;
    const path = keyPath();
    if (!existsSync(path)) {
      throw new Error(`No service account key found. Run \`npx ${PACKAGE_NAME} setup\` first.`);
    }
    clients = createClients(path);
    return clients;
  };
}
