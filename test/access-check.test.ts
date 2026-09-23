import { expect, test } from "bun:test";
import { classifyError } from "../src/cli/access-check";

test("detects a disabled API and links to the right project", () => {
  const error = new Error(
    "7 PERMISSION_DENIED: Google Analytics Admin API has not been used in project 123 before or it is disabled.",
  );
  expect(classifyError(error, "analyticsadmin.googleapis.com", "demo")).toEqual({
    status: "api-disabled",
    api: "Google Analytics Admin API",
    url: "https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com?project=demo",
  });
});

test("explains a revoked key", () => {
  const result = classifyError(new Error("invalid_grant: Invalid JWT Signature."), "analyticsadmin.googleapis.com", "demo");
  expect(result.status).toBe("error");
});
