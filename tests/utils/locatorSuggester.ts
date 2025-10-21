import { Page } from '@playwright/test';

export type SuggestedLocator = {
  type: 'testId' | 'role' | 'label' | 'placeholder' | 'text' | 'css';
  selector: string;
  confidence: number; // 0..1
  note?: string;
};

export async function suggestLocators(page: Page): Promise<SuggestedLocator[]> {
  const suggestions: SuggestedLocator[] = [];

  // data-testid first-class
  const testIdElements = await page.$$('[data-testid]');
  for (const el of testIdElements) {
    const id = await el.getAttribute('data-testid');
    if (id) suggestions.push({ type: 'testId', selector: `getByTestId('${id}')`, confidence: 1 });
  }

  // roles (buttons, links, textbox)
  const roles = [
    { role: 'button', name: true },
    { role: 'link', name: true },
    { role: 'textbox', name: true },
    { role: 'checkbox', name: true },
    { role: 'radio', name: true },
    { role: 'combobox', name: true },
  ];
  for (const { role } of roles as any[]) {
    const handles = await page.$$(`[role="${role}"]`);
    for (const h of handles) {
      const name = await h.getAttribute('aria-label') || await h.textContent();
      const safe = name?.trim()?.replace(/\s+/g, ' ').slice(0, 80);
      if (safe) suggestions.push({ type: 'role', selector: `getByRole('${role}', { name: /${escapeForRegex(safe)}/ })`, confidence: 0.9 });
    }
  }

  // labels and placeholders for inputs
  const inputs = await page.$$('input, textarea');
  for (const input of inputs) {
    const placeholder = await input.getAttribute('placeholder');
    if (placeholder) suggestions.push({ type: 'placeholder', selector: `getByPlaceholder('${escapeQuotes(placeholder)}')`, confidence: 0.8 });
  }

  // text-based
  const textNodes = await page.$$(':text("*")');
  for (const t of textNodes) {
    const txt = (await t.textContent())?.trim();
    if (txt && txt.length > 2 && txt.length < 80) {
      suggestions.push({ type: 'text', selector: `getByText(/${escapeForRegex(txt)}/)`, confidence: 0.6 });
    }
  }

  // last resort CSS for unique IDs
  const ids = await page.$$('[id]');
  for (const el of ids) {
    const id = await el.getAttribute('id');
    if (id) suggestions.push({ type: 'css', selector: `#${cssEscape(id)}`, confidence: 0.5, note: 'CSS id fallback' });
  }

  // Deduplicate by selector
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    if (seen.has(s.selector)) return false;
    seen.add(s.selector);
    return true;
  });
}

function escapeQuotes(s: string) {
  return s.replace(/'/g, "\\'");
}

function escapeForRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cssEscape(s: string) {
  return s.replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);
}


