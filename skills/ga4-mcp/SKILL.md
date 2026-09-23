---
name: ga4-mcp
description: Query Google Analytics 4 through the ga4 MCP server. Use when the user asks about website or app traffic, users, sessions, conversions, revenue, campaigns, funnels, realtime activity, or anything in their Google Analytics properties.
---

# Google Analytics 4 playbook

The `ga4` MCP server exposes read-only Google Analytics tools. It authenticates with a service account, so it only sees properties where that service account was added as a user.

## Workflow

1. **Find the property.** Call `get_account_summaries` unless the user already gave a numeric property ID. Match the property by display name; confirm with the user if more than one fits.
2. **Check custom definitions** when the question mentions something that isn't a standard GA4 field (e.g. a plan tier, author, experiment). Call `get_custom_dimensions_and_metrics` and use the returned `api_name` values (e.g. `customEvent:plan_tier`).
3. **Run the smallest report that answers the question.** Pick the tool:
   - `run_report`: historical data, the default choice.
   - `run_realtime_report`: activity in the last 30 minutes.
   - `run_funnel_report`: step-by-step conversion/drop-off between events.
   - `run_conversions_report`: ad cost, ROAS, attributed conversions with a chosen attribution model.
   - `list_property_annotations`: explain spikes or dips (releases, campaigns noted by the team).
   - `get_property_details` / `list_google_ads_links`: property settings (time zone, currency) and linked Ads accounts.
4. **Summarize** the numbers in plain language. Mention the date range and property you used.

## Argument rules

- `property_id` accepts `123456789` or `"properties/123456789"`.
- Nested fields are **snake_case**: `field_name`, `string_filter`, `match_type`, `start_date`, `dimension_name`, `metric_name`, `order_type`.
- Every dimension/metric in `order_bys` must also be in `dimensions`/`metrics`.
- Keep `limit` modest (e.g. 10–50) for top-N questions; paginate with `offset` only when the user needs everything.
- Report numbers come back as strings in `rows[].metric_values[].value`, in the order of `metric_headers`.

## Dates

`date_ranges` is a list of `{ "start_date": ..., "end_date": ..., "name": ... }`. Dates are `YYYY-MM-DD` or relative: `today`, `yesterday`, `NdaysAgo`.

- Last 7 full days: `{"start_date": "7daysAgo", "end_date": "yesterday"}`
- Period comparison: two ranges, e.g. `28daysAgo..yesterday` and `56daysAgo..29daysAgo`. The response adds a `dateRange` dimension to tell them apart.

Use `get_property_details` to learn the property's `time_zone` when "today" matters.

## Common fields

| Question | Dimensions | Metrics |
|---|---|---|
| Traffic overview | `date` | `activeUsers`, `sessions`, `screenPageViews` |
| Where visitors come from | `sessionDefaultChannelGroup` or `sessionSourceMedium` | `sessions`, `engagedSessions`, `keyEvents` |
| Top pages | `pagePath` (or `pageTitle`) | `screenPageViews`, `activeUsers`, `averageSessionDuration` |
| Landing pages | `landingPage` | `sessions`, `bounceRate`, `keyEvents` |
| Geography / devices | `country`, `city`, `deviceCategory` | `activeUsers` |
| Events | `eventName` | `eventCount`, `totalUsers` |
| E-commerce | `itemName`, `transactionId` | `purchaseRevenue`, `transactions`, `itemsPurchased` |
| Campaigns | `sessionCampaignName`, `sessionSource` | `sessions`, `keyEvents`, `totalRevenue` |
| New vs returning | `newVsReturning` | `activeUsers` |

Full lists: https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema. Realtime supports a smaller set (e.g. `unifiedScreenName`, `country`, `deviceCategory`; metrics `activeUsers`, `eventCount`, `screenPageViews`) and no custom metrics.

## Filter recipes

Exact match:
```json
{"filter": {"field_name": "sessionDefaultChannelGroup", "string_filter": {"match_type": "EXACT", "value": "Organic Search"}}}
```

Page path contains:
```json
{"filter": {"field_name": "pagePath", "string_filter": {"match_type": "CONTAINS", "value": "/blog/"}}}
```

One of several events:
```json
{"filter": {"field_name": "eventName", "in_list_filter": {"values": ["purchase", "sign_up"]}}}
```

Exclude:
```json
{"not_expression": {"filter": {"field_name": "country", "string_filter": {"match_type": "EXACT", "value": "(not set)"}}}}
```

Combine with `{"and_group": {"expressions": [ ... ]}}` or `{"or_group": {"expressions": [ ... ]}}`.

Metric threshold (goes in `metric_filter`, not `dimension_filter`):
```json
{"filter": {"field_name": "sessions", "numeric_filter": {"operation": "GREATER_THAN", "value": {"int64_value": "100"}}}}
```

Top 10 by a metric:
```json
[{"metric": {"metric_name": "sessions"}, "desc": true}]
```

## Funnels

Steps are ordered. Simplest form uses the event shorthand:
```json
[{"name": "View item", "event": "view_item"}, {"name": "Add to cart", "event": "add_to_cart"}, {"name": "Purchase", "event": "purchase"}]
```
Add `funnel_breakdown: {"breakdown_dimension": "deviceCategory"}` to split by device, or `funnel_next_action: {"next_action_dimension": "eventName", "limit": 5}` to see what users did after dropping off.

## Conversions reports

Only these dimensions: `campaignName`, `continent`, `country`, `defaultChannelGroup`, `deviceCategory`, `medium`, `platform`, `primaryChannelGroup`, `source`, `sourceMedium`, `sourcePlatform`, `subcontinent`.
Metrics are the advertiser/conversion family, e.g. `advertiserAdCost`, `advertiserAdClicks`, `allConversionsByInteractionDate`, `returnOnAdSpendByInteractionDate`, `totalRevenueByInteractionDate`.
`conversion_spec` is required: `{"conversion_actions": [], "attribution_model": "DATA_DRIVEN"}` (empty list = all conversion actions; or `LAST_CLICK`).

## Errors

- **PERMISSION_DENIED / no properties:** the service account isn't a user on that property. Tell the user to add the service account email as a Viewer in GA Admin → Property access management, or run `npx @saeedsakib/ga4-mcp status` to see the email.
- **API not enabled:** the Admin or Data API is disabled in the key's Google Cloud project; `npx @saeedsakib/ga4-mcp status` prints the enable link.
- **INVALID_ARGUMENT, incompatible dimensions/metrics:** some fields can't be combined (e.g. item-scoped with session-scoped). Drop or swap the conflicting field.
- **RESOURCE_EXHAUSTED:** property quota is used up. Pass `return_property_quota: true` to inspect it and run fewer, broader reports.
- **No key found:** the user needs to run `npx @saeedsakib/ga4-mcp setup`.
