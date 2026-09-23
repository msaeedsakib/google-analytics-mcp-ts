export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mapKeys = (value: unknown, rename: (key: string) => string): unknown => {
  if (Array.isArray(value)) return value.map((item) => mapKeys(item, rename));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [rename(key), mapKeys(item, rename)]),
  );
};

const snakeToCamel = (key: string) => key.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
const camelToSnake = (key: string) => key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);

export function camelize<T extends object>(value: Record<string, unknown>): T {
  return mapKeys(value, snakeToCamel) as T;
}

export function snakeize(value: unknown): unknown {
  return mapKeys(JSON.parse(JSON.stringify(value ?? null)), camelToSnake);
}
