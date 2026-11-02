export function componentEntries(root: string): string[];
export function expectedExports(components: string[]): Record<string, unknown>;
export function expectedTypesVersions(
  components: string[],
): Record<string, Record<string, string[]>>;
