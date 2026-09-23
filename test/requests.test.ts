import { protos } from "@google-analytics/data";
import { describe, expect, test } from "bun:test";
import { snakeize } from "../src/case";
import { conversionsReportRequest, funnelReportRequest, realtimeReportRequest, reportRequest } from "../src/tools/requests";
import { runConversionsReportInput, runFunnelReportInput, runRealtimeReportInput, runReportInput } from "../src/tools/schemas";

const beta = protos.google.analytics.data.v1beta;
const alpha = protos.google.analytics.data.v1alpha;

describe("reportRequest", () => {
  const input = runReportInput.parse({
    property_id: "properties/42",
    date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday", name: "last7" }],
    dimensions: ["eventName"],
    metrics: ["eventCount"],
    dimension_filter: {
      filter: { field_name: "eventName", string_filter: { match_type: "BEGINS_WITH", value: "add" } },
    },
    metric_filter: {
      filter: { field_name: "eventCount", numeric_filter: { operation: "GREATER_THAN", value: { int64_value: "10" } } },
    },
    order_bys: [{ metric: { metric_name: "eventCount" }, desc: true }],
    limit: 5,
  });

  test("snake_case arguments survive protobuf encoding", () => {
    const message = beta.RunReportRequest.fromObject(reportRequest(input));
    expect(message.property).toBe("properties/42");
    expect(message.dateRanges[0]?.startDate).toBe("7daysAgo");
    expect(message.dimensionFilter?.filter?.fieldName).toBe("eventName");
    expect(message.dimensionFilter?.filter?.stringFilter?.matchType).toBe(beta.Filter.StringFilter.MatchType.BEGINS_WITH);
    expect(String(message.metricFilter?.filter?.numericFilter?.value?.int64Value)).toBe("10");
    expect(message.orderBys[0]?.metric?.metricName).toBe("eventCount");
    expect(message.orderBys[0]?.desc).toBe(true);
    expect(String(message.limit)).toBe("5");
  });

  test("omits empty optional fields", () => {
    const request = reportRequest(
      runReportInput.parse({ property_id: 1, date_ranges: [], dimensions: [], metrics: [], dimension_filter: {} }),
    );
    expect(request.dimensionFilter).toBeUndefined();
    expect(request.orderBys).toBeUndefined();
    expect(request.limit).toBeUndefined();
    expect(request.returnPropertyQuota).toBe(false);
  });
});

test("realtimeReportRequest has no date ranges", () => {
  const request = realtimeReportRequest(
    runRealtimeReportInput.parse({ property_id: 7, dimensions: ["country"], metrics: ["activeUsers"] }),
  );
  expect(beta.RunRealtimeReportRequest.fromObject(request).dimensions[0]?.name).toBe("country");
  expect("dateRanges" in request).toBe(false);
});

test("conversionsReportRequest maps conversion_spec", () => {
  const request = conversionsReportRequest(
    runConversionsReportInput.parse({
      property_id: 7,
      date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
      dimensions: ["country"],
      metrics: ["advertiserAdCost"],
      conversion_spec: { conversion_actions: [], attribution_model: "LAST_CLICK" },
    }),
  );
  const message = alpha.RunReportRequest.fromObject(request);
  expect(message.conversionSpec?.attributionModel).toBe(alpha.ConversionSpec.AttributionModel.LAST_CLICK);
});

describe("funnelReportRequest", () => {
  test("supports event shorthand, filter expressions, breakdown and next action", () => {
    const request = funnelReportRequest(
      runFunnelReportInput.parse({
        property_id: 9,
        funnel_steps: [
          { name: "Start", event: "session_start" },
          {
            filter_expression: {
              funnel_field_filter: { field_name: "pagePath", string_filter: { match_type: "CONTAINS", value: "/cart" } },
            },
          },
        ],
        funnel_breakdown: { breakdown_dimension: "deviceCategory" },
        funnel_next_action: { next_action_dimension: "eventName", limit: 5 },
      }),
    );
    const message = alpha.RunFunnelReportRequest.fromObject(request);
    expect(message.funnel?.steps?.[0]?.filterExpression?.funnelEventFilter?.eventName).toBe("session_start");
    expect(message.funnel?.steps?.[1]?.name).toBe("Step 2");
    expect(message.funnel?.steps?.[1]?.filterExpression?.funnelFieldFilter?.stringFilter?.matchType).toBe(
      alpha.StringFilter.MatchType.CONTAINS,
    );
    expect(message.funnelBreakdown?.breakdownDimension?.name).toBe("deviceCategory");
    expect(String(message.funnelNextAction?.limit)).toBe("5");
  });

  test("rejects steps without an event or filter", () => {
    const input = runFunnelReportInput.parse({ property_id: 9, funnel_steps: [{ name: "Nope" }] });
    expect(() => funnelReportRequest(input)).toThrow("must contain either 'filter_expression' or 'event'");
  });
});

test("snakeize converts protobuf responses to snake_case keys", () => {
  const response = beta.RunReportResponse.fromObject({
    dimensionHeaders: [{ name: "eventName" }],
    rows: [{ metricValues: [{ value: "12" }] }],
    rowCount: 1,
  });
  expect(snakeize(response)).toEqual({
    dimension_headers: [{ name: "eventName" }],
    rows: [{ metric_values: [{ value: "12" }] }],
    row_count: 1,
  });
});
