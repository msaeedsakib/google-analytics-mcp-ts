const json = (value: unknown) => JSON.stringify(value);

const rangeJan = { start_date: "2025-01-01", end_date: "2025-01-31", name: "Jan2025" };
const rangeFeb = { start_date: "2025-02-01", end_date: "2025-02-28", name: "Feb2025" };
const rangeLastTwoDays = { start_date: "yesterday", end_date: "today", name: "YesterdayAndToday" };
const rangePrevThirtyDays = { start_date: "30daysAgo", end_date: "yesterday", name: "Previous30Days" };

export const dateRangesHints = `Example date_range arguments:
  1. A single date range:
    [ ${json(rangeJan)} ]

  2. A relative date range using 'yesterday' and 'today':
    [ ${json(rangeLastTwoDays)} ]

  3. A relative date range using 'NdaysAgo' and 'today':
    [ ${json(rangePrevThirtyDays)} ]

  4. Multiple date ranges:
    [ ${json(rangeJan)}, ${json(rangeFeb)} ]
`;

const filterNotes = `
Notes:
  The API applies the \`dimension_filter\` and \`metric_filter\` independently. As a result, some complex
  combinations of dimension and metric filters are not possible in a single report request.

  For example, you can't express:
    ((eventName = "page_view" AND eventCount > 100) OR (eventName = "join_group" AND eventCount < 50))
  because there's no way to apply "eventCount > 100" only to rows with eventName "page_view", and
  "eventCount < 50" only to rows with eventName "join_group".

  More generally, you can't define a \`dimension_filter\` and \`metric_filter\` for:
    (((dimension condition D1) AND (metric condition M1)) OR ((dimension condition D2) AND (metric condition M2)))

  For conditions like this, either:
  a) Run a single report that applies the subset of conditions the API supports and includes the data needed
     to filter the response client side. For the example above, filter on eventName one of "page_view" or
     "join_group", include eventCount, then apply the per-event metric conditions to the response.
  b) Run a separate report for each combination, e.g. one for (D1 AND M1) and another for (D2 AND M2).

  Prefer fewer reports (option a). If that causes excessive quota usage, use option b. More on quota usage at
  https://developers.google.com/analytics/blog/2023/data-api-quota-management.
`;

const eventCountGt10 = {
  filter: {
    field_name: "eventCount",
    numeric_filter: { operation: "GREATER_THAN", value: { int64_value: "10" } },
  },
};
const revenueBetween = {
  filter: {
    field_name: "purchaseRevenue",
    between_filter: { from_value: { double_value: 10 }, to_value: { double_value: 25 } },
  },
};

export const metricFilterHints = `Example metric_filter arguments:
  1. A simple filter:
    ${json(eventCountGt10)}

  2. A NOT filter:
    ${json({ not_expression: eventCountGt10 })}

  3. An empty value filter:
    ${json({ filter: { field_name: "purchaseRevenue", empty_filter: {} } })}

  4. An AND group filter:
    ${json({ and_group: { expressions: [eventCountGt10, revenueBetween] } })}

  5. An OR group filter:
    ${json({ or_group: { expressions: [eventCountGt10, revenueBetween] } })}
${filterNotes}`;

const beginsWith = {
  filter: { field_name: "eventName", string_filter: { match_type: "BEGINS_WITH", value: "add" } },
};
const sourceMedium = {
  filter: { field_name: "sourceMedium", string_filter: { match_type: "EXACT", value: "google / cpc" } },
};
const eventList = {
  filter: {
    field_name: "eventName",
    in_list_filter: { case_sensitive: true, values: ["first_visit", "purchase", "add_to_cart"] },
  },
};

export const dimensionFilterHints = `Example dimension_filter arguments:
  1. A simple filter:
    ${json(beginsWith)}

  2. A NOT filter:
    ${json({ not_expression: beginsWith })}

  3. An empty value filter:
    ${json({ filter: { field_name: "source", empty_filter: {} } })}

  4. An AND group filter:
    ${json({ and_group: { expressions: [sourceMedium, eventList] } })}

  5. An OR group filter:
    ${json({ or_group: { expressions: [sourceMedium, eventList] } })}
${filterNotes}`;

const eventNameAsc = { dimension: { dimension_name: "eventName", order_type: "ALPHANUMERIC" }, desc: false };
const campaignNoCaseDesc = {
  dimension: { dimension_name: "campaignName", order_type: "CASE_INSENSITIVE_ALPHANUMERIC" },
  desc: true,
};
const audienceIdAsc = { dimension: { dimension_name: "audienceId", order_type: "NUMERIC" }, desc: false };
const eventCountAsc = { metric: { metric_name: "eventCount" }, desc: false };
const eventValueDesc = { metric: { metric_name: "eventValue" }, desc: true };

export const orderBysHints = `Example order_bys arguments:
  1. Order by ascending 'eventName':
    [ ${json(eventNameAsc)} ]

  2. Order by descending 'campaignName', ignoring case:
    [ ${json(campaignNoCaseDesc)} ]

  3. Order by ascending 'audienceId':
    [ ${json(audienceIdAsc)} ]

  4. Order by descending 'eventValue':
    [ ${json(eventValueDesc)} ]

  5. Order by ascending 'eventCount':
    [ ${json(eventCountAsc)} ]

  6. Combination of dimension and metric order bys:
    [ ${json(eventNameAsc)}, ${json(eventValueDesc)} ]

  7. Order by multiple dimensions and metrics:
    [ ${json(eventNameAsc)}, ${json(audienceIdAsc)}, ${json(eventValueDesc)} ]

The dimensions and metrics in order_bys must also be present in the report request's "dimensions" and
"metrics" arguments, respectively.
`;

const eventStep = (event_name: string) => ({ funnel_event_filter: { event_name } });
const anyEvent = (...names: string[]) => ({ or_group: { expressions: names.map(eventStep) } });

const stepFirstOpen = { name: "First open/visit", filter_expression: anyEvent("first_open", "first_visit") };
const stepOrganic = {
  name: "Organic visitors",
  filter_expression: {
    funnel_field_filter: {
      field_name: "firstUserMedium",
      string_filter: { match_type: "CONTAINS", case_sensitive: false, value: "organic" },
    },
  },
};
const stepSessionStart = { name: "Session start", filter_expression: eventStep("session_start") };
const stepPageView = { name: "Screen/Page view", filter_expression: anyEvent("screen_view", "page_view") };
const stepPurchase = { name: "Purchase", filter_expression: anyEvent("purchase", "in_app_purchase") };
const stepAddToCart = {
  name: "Add to cart (value > 50)",
  filter_expression: {
    funnel_event_filter: {
      event_name: "add_to_cart",
      funnel_parameter_filter_expression: {
        funnel_parameter_filter: {
          event_parameter_name: "value",
          numeric_filter: { operation: "GREATER_THAN", value: { double_value: 50 } },
        },
      },
    },
  },
};
const stepHomePage = {
  name: "Home page view",
  filter_expression: {
    and_group: {
      expressions: [
        eventStep("page_view"),
        { funnel_field_filter: { field_name: "pageLocation", string_filter: { match_type: "CONTAINS", value: "/" } } },
      ],
    },
  },
};

export const funnelStepsHints = `Example funnel_steps configurations:
  1. Simple event-based step (first open/visit):
    ${json(stepFirstOpen)}

  2. Field filter for organic traffic:
    ${json(stepOrganic)}

  3. Simple event filter:
    ${json(stepSessionStart)}

  4. Multiple events with OR condition:
    ${json(stepPageView)}

  5. Purchase events (multiple event types):
    ${json(stepPurchase)}

  6. Event with parameter filter (value > 50):
    ${json(stepAddToCart)}

  7. Complex AND condition (page view + specific path):
    ${json(stepHomePage)}

  Shorthand for a single event step: {"name": "Purchase", "event": "purchase"}

Complete funnel example, a typical e-commerce funnel with 5 steps:
  [ ${[stepFirstOpen, stepOrganic, stepSessionStart, stepPageView, stepPurchase].map(json).join(", ")} ]
`;
