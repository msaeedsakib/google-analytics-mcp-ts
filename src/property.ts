export type PropertyId = number | string;

export function propertyResourceName(value: PropertyId): string {
  const raw = typeof value === "number" ? String(value) : value.trim();
  const numeric = raw.startsWith("properties/") ? raw.slice("properties/".length) : raw;
  if (!/^\d+$/.test(numeric)) {
    throw new Error(
      `Invalid property ID: ${value}. A valid property value is either a number or a string starting with 'properties/' and followed by a number.`,
    );
  }
  return `properties/${Number(numeric)}`;
}
