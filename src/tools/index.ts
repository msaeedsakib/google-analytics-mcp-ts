import type { CallToolResult, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { snakeize } from "../case";
import type { Clients } from "../clients";
import { propertyResourceName } from "../property";
import * as descriptions from "./descriptions";
import { conversionsReportRequest, funnelReportRequest, realtimeReportRequest, reportRequest } from "./requests";
import {
  propertyInput,
  runConversionsReportInput,
  runFunnelReportInput,
  runRealtimeReportInput,
  runReportInput,
} from "./schemas";

const readOnly = { readOnlyHint: true, openWorldHint: true };

async function respond(name: string, run: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return { content: [{ type: "text", text: JSON.stringify(snakeize(await run()), null, 2) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Failed to execute tool '${name}': ${message}` }) }],
      isError: true,
    };
  }
}

async function collect<T>(items: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of items) result.push(item);
  return result;
}

export function registerTools(server: McpServer, clients: () => Clients): void {
  server.registerTool(
    "get_account_summaries",
    { description: descriptions.getAccountSummariesDescription, inputSchema: z.object({}), annotations: readOnly },
    () => respond("get_account_summaries", () => collect(clients().adminBeta.listAccountSummariesAsync({}, { autoPaginate: false }))),
  );

  server.registerTool(
    "list_google_ads_links",
    { description: descriptions.listGoogleAdsLinksDescription, inputSchema: propertyInput, annotations: readOnly },
    ({ property_id }) =>
      respond("list_google_ads_links", () =>
        collect(clients().adminBeta.listGoogleAdsLinksAsync({ parent: propertyResourceName(property_id) }, { autoPaginate: false })),
      ),
  );

  server.registerTool(
    "get_property_details",
    { description: descriptions.getPropertyDetailsDescription, inputSchema: propertyInput, annotations: readOnly },
    ({ property_id }) =>
      respond("get_property_details", async () => {
        const [property] = await clients().adminBeta.getProperty({ name: propertyResourceName(property_id) });
        return property;
      }),
  );

  server.registerTool(
    "list_property_annotations",
    { description: descriptions.listPropertyAnnotationsDescription, inputSchema: propertyInput, annotations: readOnly },
    ({ property_id }) =>
      respond("list_property_annotations", () =>
        collect(
          clients().adminAlpha.listReportingDataAnnotationsAsync({ parent: propertyResourceName(property_id) }, { autoPaginate: false }),
        ),
      ),
  );

  server.registerTool(
    "get_custom_dimensions_and_metrics",
    {
      description: descriptions.getCustomDimensionsAndMetricsDescription,
      inputSchema: propertyInput,
      annotations: readOnly,
    },
    ({ property_id }) =>
      respond("get_custom_dimensions_and_metrics", async () => {
        const [metadata] = await clients().dataBeta.getMetadata({
          name: `${propertyResourceName(property_id)}/metadata`,
        });
        return {
          customDimensions: (metadata.dimensions ?? []).filter((dimension) => dimension.customDefinition),
          customMetrics: (metadata.metrics ?? []).filter((metric) => metric.customDefinition),
        };
      }),
  );

  server.registerTool(
    "run_report",
    { description: descriptions.runReportDescription, inputSchema: runReportInput, annotations: readOnly },
    (input) =>
      respond("run_report", async () => {
        const [response] = await clients().dataBeta.runReport(reportRequest(input));
        return response;
      }),
  );

  server.registerTool(
    "run_realtime_report",
    { description: descriptions.runRealtimeReportDescription, inputSchema: runRealtimeReportInput, annotations: readOnly },
    (input) =>
      respond("run_realtime_report", async () => {
        const [response] = await clients().dataBeta.runRealtimeReport(realtimeReportRequest(input));
        return response;
      }),
  );

  server.registerTool(
    "run_funnel_report",
    { description: descriptions.runFunnelReportDescription, inputSchema: runFunnelReportInput, annotations: readOnly },
    (input) =>
      respond("run_funnel_report", async () => {
        const [response] = await clients().dataAlpha.runFunnelReport(funnelReportRequest(input));
        return response;
      }),
  );

  server.registerTool(
    "run_conversions_report",
    {
      description: descriptions.runConversionsReportDescription,
      inputSchema: runConversionsReportInput,
      annotations: readOnly,
    },
    (input) =>
      respond("run_conversions_report", async () => {
        const [response] = await clients().dataAlpha.runReport(conversionsReportRequest(input));
        return response;
      }),
  );
}
