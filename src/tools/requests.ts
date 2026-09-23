import type { protos as dataProtos } from "@google-analytics/data";
import { camelize, isPlainObject } from "../case";
import { propertyResourceName } from "../property";
import type { RunConversionsReportInput, RunFunnelReportInput, RunRealtimeReportInput, RunReportInput } from "./schemas";

type BetaFilter = dataProtos.google.analytics.data.v1beta.IFilterExpression;
type BetaOrderBy = dataProtos.google.analytics.data.v1beta.IOrderBy;
type BetaDateRange = dataProtos.google.analytics.data.v1beta.IDateRange;
type AlphaFilter = dataProtos.google.analytics.data.v1alpha.IFilterExpression;
type AlphaOrderBy = dataProtos.google.analytics.data.v1alpha.IOrderBy;
type AlphaDateRange = dataProtos.google.analytics.data.v1alpha.IDateRange;

const named = (names: string[]) => names.map((name) => ({ name }));
const optionalObject = <T extends object>(value: Record<string, unknown> | undefined) =>
  value && Object.keys(value).length > 0 ? camelize<T>(value) : undefined;
const optionalList = <T extends object>(values: Record<string, unknown>[] | undefined) =>
  values && values.length > 0 ? values.map((value) => camelize<T>(value)) : undefined;
const positive = (value: number | undefined) => (value ? value : undefined);

export function reportRequest(input: RunReportInput): dataProtos.google.analytics.data.v1beta.IRunReportRequest {
  return {
    property: propertyResourceName(input.property_id),
    dimensions: named(input.dimensions),
    metrics: named(input.metrics),
    dateRanges: input.date_ranges.map((range) => camelize<BetaDateRange>(range)),
    dimensionFilter: optionalObject<BetaFilter>(input.dimension_filter),
    metricFilter: optionalObject<BetaFilter>(input.metric_filter),
    orderBys: optionalList<BetaOrderBy>(input.order_bys),
    limit: positive(input.limit),
    offset: positive(input.offset),
    currencyCode: input.currency_code || undefined,
    returnPropertyQuota: input.return_property_quota,
  };
}

export function realtimeReportRequest(
  input: RunRealtimeReportInput,
): dataProtos.google.analytics.data.v1beta.IRunRealtimeReportRequest {
  return {
    property: propertyResourceName(input.property_id),
    dimensions: named(input.dimensions),
    metrics: named(input.metrics),
    dimensionFilter: optionalObject<BetaFilter>(input.dimension_filter),
    metricFilter: optionalObject<BetaFilter>(input.metric_filter),
    orderBys: optionalList<BetaOrderBy>(input.order_bys),
    limit: positive(input.limit),
    returnPropertyQuota: input.return_property_quota,
  };
}

export function conversionsReportRequest(
  input: RunConversionsReportInput,
): dataProtos.google.analytics.data.v1alpha.IRunReportRequest {
  return {
    property: propertyResourceName(input.property_id),
    dimensions: named(input.dimensions),
    metrics: named(input.metrics),
    dateRanges: input.date_ranges.map((range) => camelize<AlphaDateRange>(range)),
    conversionSpec: camelize<dataProtos.google.analytics.data.v1alpha.IConversionSpec>(input.conversion_spec),
    dimensionFilter: optionalObject<AlphaFilter>(input.dimension_filter),
    metricFilter: optionalObject<AlphaFilter>(input.metric_filter),
    orderBys: optionalList<AlphaOrderBy>(input.order_bys),
    limit: positive(input.limit),
    offset: positive(input.offset),
    currencyCode: input.currency_code || undefined,
    returnPropertyQuota: input.return_property_quota,
  };
}

function funnelStep(step: Record<string, unknown>, index: number): dataProtos.google.analytics.data.v1alpha.IFunnelStep {
  const name = typeof step.name === "string" ? step.name : `Step ${index + 1}`;
  if (isPlainObject(step.filter_expression)) {
    return {
      name,
      filterExpression: camelize<dataProtos.google.analytics.data.v1alpha.IFunnelFilterExpression>(step.filter_expression),
    };
  }
  if (typeof step.event === "string") {
    return { name, filterExpression: { funnelEventFilter: { eventName: step.event } } };
  }
  throw new Error(`Step ${index + 1} must contain either 'filter_expression' or 'event' key`);
}

export function funnelReportRequest(
  input: RunFunnelReportInput,
): dataProtos.google.analytics.data.v1alpha.IRunFunnelReportRequest {
  const breakdown = input.funnel_breakdown?.breakdown_dimension;
  const nextAction = input.funnel_next_action?.next_action_dimension;
  const nextActionLimit = input.funnel_next_action?.limit;
  return {
    property: propertyResourceName(input.property_id),
    funnel: { steps: input.funnel_steps.map(funnelStep) },
    dateRanges: (input.date_ranges ?? []).map((range) => camelize<AlphaDateRange>(range)),
    funnelBreakdown: typeof breakdown === "string" ? { breakdownDimension: { name: breakdown } } : undefined,
    funnelNextAction:
      typeof nextAction === "string"
        ? {
            nextActionDimension: { name: nextAction },
            limit: typeof nextActionLimit === "number" ? nextActionLimit : undefined,
          }
        : undefined,
    segments: optionalList<dataProtos.google.analytics.data.v1alpha.ISegment>(input.segments),
    returnPropertyQuota: input.return_property_quota,
  };
}
