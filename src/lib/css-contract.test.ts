// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Static contract checks for the CSS-only cross-cutting rules (REQUIREMENTS.md §1).
// jsdom cannot compute styles, so these read the source files directly and make
// regressions mechanical:
//   CC-13 — all library CSS lives inside @layer ic.base
//   CC-9  — files declaring motion also guard it with prefers-reduced-motion
//   CC-3  — outline: none is never used without a :focus-visible/:focus-within replacement
//   CC-7  — decorative inline SVGs carry aria-hidden="true" and focusable="false"
// The visual judgment halves (is the focus ring actually visible, etc.) stay on the
// manual browser checklist in REQUIREMENTS.md §13.

// Vitest runs from the project root; jsdom rewrites import.meta.url, so resolve from cwd.
const LIB = join(process.cwd(), 'src/lib/');

function collect(dir: string, ext: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collect(path, ext);
    return entry.name.endsWith(ext) ? [path] : [];
  });
}

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rel = (path: string) => path.slice(LIB.length);

const cssFiles = collect(LIB, '.css');
const tsxFiles = collect(LIB, '.tsx').filter((f) => !f.endsWith('.test.tsx'));

describe('CSS contract (static checks)', () => {
  it('found the library stylesheets', () => {
    expect(cssFiles.length).toBeGreaterThanOrEqual(12);
  });

  it('CC-13: every stylesheet wraps ALL rules in @layer ic.base', () => {
    const violations: string[] = [];
    for (const file of cssFiles) {
      const css = stripComments(readFileSync(file, 'utf8')).trim();
      if (!css.startsWith('@layer ic.base {')) {
        violations.push(`${rel(file)}: does not start with @layer ic.base`);
        continue;
      }
      // Walk the braces of the layer block; nothing may follow its closing brace.
      let depth = 0;
      let end = -1;
      for (let i = css.indexOf('{'); i < css.length; i++) {
        if (css[i] === '{') depth++;
        if (css[i] === '}') depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
      if (end === -1 || css.slice(end + 1).trim() !== '') {
        violations.push(`${rel(file)}: has rules outside the @layer ic.base block`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('CC-9: motion is always guarded by prefers-reduced-motion', () => {
    const violations: string[] = [];
    for (const file of cssFiles) {
      const css = stripComments(readFileSync(file, 'utf8'));
      const declaresMotion = /(?:transition|animation|scroll-behavior)\s*:/.test(css);
      if (declaresMotion && !css.includes('@media (prefers-reduced-motion: reduce)')) {
        violations.push(`${rel(file)}: declares motion without a reduced-motion guard`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('CC-3: outline is never removed without a focus-style replacement in the same file', () => {
    const violations: string[] = [];
    for (const file of cssFiles) {
      const css = stripComments(readFileSync(file, 'utf8'));
      const removesOutline = /outline\s*:\s*(?:none|0)/.test(css);
      const replaces = css.includes(':focus-visible') || css.includes(':focus-within');
      if (removesOutline && !replaces) {
        violations.push(`${rel(file)}: outline removed with no :focus-visible/:focus-within rule`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('CC-7: decorative inline SVGs are aria-hidden and unfocusable', () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const source = readFileSync(file, 'utf8');
      // Match JSX <svg …> opening tags (multiline); skip "<svg" inside string literals
      // (e.g. an svg data-URI placeholder) by checking the preceding character.
      const tag = /<svg[\s\S]*?>/g;
      let match: RegExpExecArray | null;
      while ((match = tag.exec(source)) !== null) {
        const before = source[match.index - 1];
        if (before === "'" || before === '"' || before === '`') continue;
        if (!match[0].includes('aria-hidden="true"') || !match[0].includes('focusable="false"')) {
          violations.push(`${rel(file)}: <svg> without aria-hidden="true" + focusable="false"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
