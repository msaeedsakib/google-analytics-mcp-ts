import pc from "picocolors";
import type { ServiceAccount } from "../credentials";
import type { AccessResult } from "./access-check";

export const log = {
  info: (message: string) => console.log(message),
  success: (message: string) => console.log(`${pc.green("✔")} ${message}`),
  warn: (message: string) => console.log(`${pc.yellow("!")} ${message}`),
  error: (message: string) => console.log(`${pc.red("✖")} ${message}`),
  step: (message: string) => console.log(`\n${pc.bold(message)}`),
};

export function reportAccess(result: AccessResult, account: ServiceAccount): void {
  switch (result.status) {
    case "ok":
      log.success(`Access verified. ${result.properties.length} propert${result.properties.length === 1 ? "y" : "ies"} visible:`);
      for (const property of result.properties) {
        log.info(`  ${pc.dim(property.property)}  ${property.displayName} ${pc.dim(`(${property.account})`)}`);
      }
      return;
    case "api-disabled":
      log.error(`The ${result.api} is not enabled in project ${pc.bold(account.project_id)}.`);
      log.info(`  Enable it here: ${pc.cyan(result.url)}`);
      log.info(pc.dim("  It can take a minute or two to take effect after enabling."));
      return;
    case "no-properties":
      log.warn("The service account can't see any Google Analytics properties yet.");
      log.info(`  1. Copy this email: ${pc.bold(pc.cyan(account.client_email))}`);
      log.info("  2. In Google Analytics open Admin → Property → Property access management");
      log.info("  3. Click + → Add users, paste the email, choose the Viewer role and click Add");
      return;
    case "error":
      log.error(result.message);
      return;
  }
}
