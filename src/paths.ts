import { homedir } from "node:os";
import { join } from "node:path";

export const PACKAGE_NAME = "@saeedsakib/ga4-mcp";
export const SERVER_NAME = "ga4";
export const SKILL_NAME = "ga4-mcp";

export const home = () => process.env.HOME || homedir();

export function configDir(): string {
  if (process.platform === "win32" && process.env.APPDATA) return join(process.env.APPDATA, "ga4-mcp");
  return join(process.env.XDG_CONFIG_HOME || join(home(), ".config"), "ga4-mcp");
}

export function keyPath(): string {
  return join(configDir(), "service-account.json");
}

export function skillSourceDir(): string {
  return join(import.meta.dirname, "..", "skills", SKILL_NAME);
}
