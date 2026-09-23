import { dateRangesHints, dimensionFilterHints, funnelStepsHints, metricFilterHints, orderBysHints } from "./hints";

const filterAndOrderHints = `### Hints for \`date_ranges\`
${dateRangesHints}
### Hints for \`dimension_filter\`
${dimensionFilterHints}
### Hints for \`metric_filter\`
${metricFilterHints}
### Hints for \`order_bys\`
${orderBysHints}`;

const snakeCaseNote = `Field names in nested objects (filters, order_bys, date_ranges) must be snake_case, e.g. field_name,
string_filter, match_type, start_date. The REST reference docs use camelCase, but this tool expects snake_case.`;

export const getAccountSummariesDescription =
  "Retrieves information about the user's Google Analytics accounts and properties.";

export const listGoogleAdsLinksDescription = "Returns a list of links to Google Ads accounts for a property.";

export const getPropertyDetailsDescription = "Returns details about a property.";

export const listPropertyAnnotationsDescription = `Returns annotations for a property.

Annotations are a feature that allows you to leave notes on GA4 for specific dates or periods. They are typically
used to record service releases, marketing campaign launches or changes, and rapid traffic increases or decreases
due to external factors.`;

export const getCustomDimensionsAndMetricsDescription = "Returns the property's custom dimensions and metrics.";

export const runReportDescription = `Runs a Google Analytics Data API report.

${snakeCaseNote}

## Hints for arguments

### Hints for \`dimensions\`
The \`dimensions\` list must consist solely of either:
1. Standard dimensions from https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#dimensions.
   These are available to every property.
2. Custom dimensions for the \`property_id\`. Use the \`get_custom_dimensions_and_metrics\` tool to list them.

### Hints for \`metrics\`
The \`metrics\` list must consist solely of either:
1. Standard metrics from https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#metrics.
   These are available to every property.
2. Custom metrics for the \`property_id\`. Use the \`get_custom_dimensions_and_metrics\` tool to list them.

${filterAndOrderHints}`;

export const runRealtimeReportDescription = `Runs a Google Analytics Data API realtime report.

See https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-basics for more information.

${snakeCaseNote}

## Hints for arguments

### Hints for \`dimensions\`
The \`dimensions\` list must consist solely of either:
1. Realtime standard dimensions from
   https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-api-schema#dimensions.
2. User-scoped custom dimensions for the \`property_id\`. Use the \`get_custom_dimensions_and_metrics\` tool and look
   for custom dimensions with an \`api_name\` that begins with "customUser:".

### Hints for \`metrics\`
The \`metrics\` list must consist solely of the realtime standard metrics from
https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-api-schema#metrics.
Realtime reports can't use custom metrics.

### Hints for \`dimension_filter\`
${dimensionFilterHints}
### Hints for \`metric_filter\`
${metricFilterHints}
### Hints for \`order_bys\`
${orderBysHints}`;

export const runFunnelReportDescription = `Runs a Google Analytics Data API funnel report.

See the funnel report guide at https://developers.google.com/analytics/devguides/reporting/data/v1/funnels for
details and examples. Returns the funnel_table and funnel_visualization, plus property_quota if requested.

${snakeCaseNote}

## Hints for arguments

### Hints for \`funnel_breakdown\`
Segments funnel results by a dimension: {"breakdown_dimension": "deviceCategory"}
Common breakdown dimensions: deviceCategory, country, operatingSystem, browser.

### Hints for \`funnel_next_action\`
Analyzes what users do after completing or dropping off from the funnel:
{"next_action_dimension": "eventName", "limit": 5}
Common next action dimensions: eventName, pagePath.

### Hints for \`segments\`
Each segment is a Segment object. See https://developers.google.com/analytics/devguides/reporting/data/v1/funnels#segments.

### Hints for \`date_ranges\`
${dateRangesHints}
### Hints for \`funnel_steps\`
${funnelStepsHints}`;

export const runConversionsReportDescription = `Runs a Google Analytics Data API conversions report.

USE THIS TOOL INSTEAD OF \`run_report\` WHEN:
- You need to report specifically on conversions, ad performance, return on ad spend (ROAS), or attribution.
- You need conversion metrics such as advertiserAdCost, returnOnAdSpendByInteractionDate, allConversionsByConversionDate.
- You need a specific attribution model (DATA_DRIVEN or LAST_CLICK).
- The user's query explicitly asks about conversions, ad clicks, ad costs, or campaigns related to conversions.

See https://developers.google.com/analytics/devguides/reporting/data/v1/conversions-api-basics for details.

${snakeCaseNote}

## Hints for arguments

### Hints for \`dimensions\`
Allowed dimensions: campaignName, continent, country, defaultChannelGroup, deviceCategory, medium, platform,
primaryChannelGroup, source, sourceMedium, sourcePlatform, subcontinent.

### Hints for \`metrics\`
Allowed metrics: advertiserAdClicks, advertiserAdCost, advertiserAdCostPerAllConversionsByConversionDate,
advertiserAdCostPerAllConversionsByInteractionDate, advertiserAdCostPerClick, advertiserAdImpressions,
allConversionsByConversionDate, allConversionsByInteractionDate, returnOnAdSpendByConversionDate,
returnOnAdSpendByInteractionDate, totalRevenueByConversionDate, totalRevenueByInteractionDate.

### Hints for \`conversion_spec\`
Required. Pass an empty list for \`conversion_actions\` to include all conversion events:
{"conversion_actions": ["conversionActions/12345"], "attribution_model": "DATA_DRIVEN"}

${filterAndOrderHints}`;
