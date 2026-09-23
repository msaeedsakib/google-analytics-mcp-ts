import { describe, expect, test } from "bun:test";
import { propertyResourceName } from "../src/property";

describe("propertyResourceName", () => {
  test.each([
    [123, "properties/123"],
    ["123", "properties/123"],
    [" 123 ", "properties/123"],
    ["properties/456", "properties/456"],
  ])("%p → %p", (input, expected) => {
    expect(propertyResourceName(input)).toBe(expected);
  });

  test.each(["", "abc", "properties/", "properties/abc", "accounts/1", "12.5"])("rejects %p", (input) => {
    expect(() => propertyResourceName(input)).toThrow("Invalid property ID");
  });
});
