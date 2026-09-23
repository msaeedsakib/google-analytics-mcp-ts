# ga4-mcp

A Google Analytics 4 MCP server with a one-command setup. It is a TypeScript rewrite of Google's
[google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp). You don't need gcloud, Python,
OAuth clients or env vars: give it a service account key and pick your agents.

```bash
npx @saeedsakib/ga4-mcp setup
```

Setup does four things:

1. Asks for the path to your service account JSON key and stores a copy in `~/.config/ga4-mcp/` (owner-only permissions).
2. Checks access live. If an API isn't enabled or the service account can't see any property, it tells you exactly what to fix and waits while you do.
3. Adds the MCP server to **Claude Code**, **Cursor** and/or **Codex**, and installs the bundled `ga4-mcp` skill so the agent knows how to query GA4 well.
4. Prints a config snippet for any other MCP client or custom harness.

Restart your agent and ask something like *"How did organic traffic change over the last 28 days?"*

## Before you start: get a service account key

1. In [Google Cloud Console](https://console.cloud.google.com/), pick or create a project and enable the
   [Google Analytics Admin API](https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com) and the
   [Google Analytics Data API](https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com).
2. Go to **IAM & Admin → Service Accounts → Create service account**. It needs no Cloud roles.
3. Open the service account, go to **Keys → Add key → Create new key → JSON**, and download it.
4. In Google Analytics, go to **Admin → Property access management → + → Add users**. Paste the service account email
   (`…@….iam.gserviceaccount.com`), choose **Viewer** and save. Repeat for each property you want the agent to see.

Setup checks each of these steps and tells you which one is missing.

## Commands

| Command | What it does |
|---|---|
| `npx @saeedsakib/ga4-mcp setup` | Store a key, verify access, configure agents |
| `npx @saeedsakib/ga4-mcp status` | Show the stored key and configured agents, then re-check access |
| `npx @saeedsakib/ga4-mcp remove` | Remove the server and skill from agents, and optionally delete the key |
| `npx @saeedsakib/ga4-mcp` | Start the stdio MCP server (this is what agents run) |

## Custom harnesses

Any MCP client that can spawn a stdio server works. Run `setup` once to store the key, then point your client at:

```json
{
  "mcpServers": {
    "ga4": { "command": "npx", "args": ["-y", "@saeedsakib/ga4-mcp"] }
  }
}
```

Give your agent [`skills/ga4-mcp/SKILL.md`](skills/ga4-mcp/SKILL.md) as instructions if it supports skills or system prompts.

## Tools

All tools are read-only and match upstream's tool names and arguments.

| Tool | Description |
|---|---|
| `get_account_summaries` | Accounts and properties the service account can see |
| `get_property_details` | Property settings (time zone, currency, …) |
| `list_google_ads_links` | Google Ads accounts linked to a property |
| `list_property_annotations` | Notes left on dates (releases, campaigns) |
| `get_custom_dimensions_and_metrics` | A property's custom definitions |
| `run_report` | Core Data API report |
| `run_realtime_report` | Last 30 minutes of activity |
| `run_funnel_report` | Funnel steps with drop-off, breakdowns and next actions |
| `run_conversions_report` | Ad cost, ROAS and attributed conversions |

## Where things are written

| | Path |
|---|---|
| Key | `$XDG_CONFIG_HOME/ga4-mcp/service-account.json` (default `~/.config/…`, or `%APPDATA%\ga4-mcp\` on Windows) |
| Claude Code | `~/.claude.json` → `mcpServers.ga4`, skill in `~/.claude/skills/ga4-mcp/` (respects `CLAUDE_CONFIG_DIR`) |
| Cursor | `~/.cursor/mcp.json` → `mcpServers.ga4`, skill in `~/.cursor/skills/ga4-mcp/` |
| Codex | `~/.codex/config.toml` → `[mcp_servers.ga4]`, skill in `~/.agents/skills/ga4-mcp/` (respects `CODEX_HOME`) |

Setup only changes its own `ga4` entry and leaves the rest of each config file as it was.

## Development

```bash
bun install
bun test
bun run typecheck
bun run build
```

The published package runs on Node 20.11 or later.

## License

Apache-2.0. See [NOTICE](NOTICE) for attribution to the original Google project.
