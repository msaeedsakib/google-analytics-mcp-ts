import { z } from "zod";

const PROPERTY_ID_DOC =
  "The Google Analytics property ID. Accepted formats are a number, or a string consisting of 'properties/' followed by a number.";

const freeObject = z.record(z.string(), z.unknown()).meta({ additionalProperties: true });

export const propertyId = z.union([z.number().int(), z.string()]).describe(PROPERTY_ID_DOC);

export const propertyInput = z.object({ property_id: propertyId });

const dateRanges = z
  .array(freeObject)
  .describe("A list of date ranges (https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/DateRange) to include in the report.");
const dimensions = z.array(z.string()).describe("A list of dimensions to include in the report.");
const metrics = z.array(z.string()).describe("A list of metrics to include in the report.");
const dimensionFilter = freeObject
  .optional()
  .describe(
    "A Data API FilterExpression (https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/FilterExpression) to apply to the dimensions. Don't use this for filtering metrics. Use metric_filter instead.",
  );
const metricFilter = freeObject
  .optional()
  .describe(
    "A Data API FilterExpression (https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/FilterExpression) to apply to the metrics. Don't use this for filtering dimensions. Use dimension_filter instead.",
  );
const orderBys = z
  .array(freeObject)
  .optional()
  .describe("A list of Data API OrderBy (https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/OrderBy) objects to apply to the dimensions and metrics.");
const limit = z
  .number()
  .int()
  .optional()
  .describe("The maximum number of rows to return in each response. Must be a positive integer <= 250,000. Used to paginate through large reports.");
const offset = z.number().int().optional().describe("The row count of the start row. The first row is counted as row 0. Used to paginate through large reports.");
const currencyCode = z
  .string()
  .optional()
  .describe("The currency code to use for currency values, in ISO4217 format such as \"AED\", \"USD\", \"JPY\". If empty, the report uses the property's default currency.");
const returnPropertyQuota = z.boolean().default(false).describe("Whether to return property quota in the response.");

export const runReportInput = z.object({
  property_id: propertyId,
  date_ranges: dateRanges,
  dimensions,
  metrics,
  dimension_filter: dimensionFilter,
  metric_filter: metricFilter,
  order_bys: orderBys,
  limit,
  offset,
  currency_code: currencyCode,
  return_property_quota: returnPropertyQuota,
});

export const runRealtimeReportInput = z.object({
  property_id: propertyId,
  dimensions: dimensions.describe("A list of dimensions to include in the report. Dimensions must be realtime dimensions."),
  metrics: metrics.describe("A list of metrics to include in the report. Metrics must be realtime metrics."),
  dimension_filter: dimensionFilter,
  metric_filter: metricFilter,
  order_bys: orderBys,
  limit,
  return_property_quota: returnPropertyQuota,
});

export const runFunnelReportInput = z.object({
  property_id: propertyId,
  funnel_steps: z
    .array(freeObject)
    .min(1)
    .describe(
      "A list of funnel steps. Each step is either {'name': str, 'filter_expression': FunnelFilterExpression} or, for simple event-based steps, {'name': str, 'event': str}.",
    ),
  date_ranges: dateRanges.optional(),
  funnel_breakdown: freeObject
    .optional()
    .describe("Optional breakdown dimension to segment the funnel. Example: {\"breakdown_dimension\": \"deviceCategory\"}"),
  funnel_next_action: freeObject
    .optional()
    .describe("Optional next action analysis configuration. Example: {\"next_action_dimension\": \"eventName\", \"limit\": 5}"),
  segments: z.array(freeObject).optional().describe("Optional list of segments to apply to the funnel."),
  return_property_quota: returnPropertyQuota.describe("Whether to return current property quota information."),
});

export const runConversionsReportInput = runReportInput.extend({
  conversion_spec: freeObject.describe(
    "The specification for conversions reporting. Should include 'conversion_actions' (list of resource names, or [] for all) and 'attribution_model' ('DATA_DRIVEN' or 'LAST_CLICK').",
  ),
});

export type RunReportInput = z.infer<typeof runReportInput>;
export type RunRealtimeReportInput = z.infer<typeof runRealtimeReportInput>;
export type RunFunnelReportInput = z.infer<typeof runFunnelReportInput>;
export type RunConversionsReportInput = z.infer<typeof runConversionsReportInput>;
