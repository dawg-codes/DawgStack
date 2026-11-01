import axe from 'axe-core';

/**
 * Runs axe-core on a rendered container and returns readable violations (empty = pass).
 * Colour contrast can't be measured in jsdom (no layout or computed colours); it is covered
 * by test/tokens.test.ts and by the real-browser check of the playground.
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      // Components are tested in isolation, outside page landmarks.
      region: { enabled: false },
    },
  });
  return results.violations.map(
    (v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.html).join(' | ')}`,
  );
}
