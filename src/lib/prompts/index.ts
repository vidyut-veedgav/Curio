import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads a prompt from a markdown file and interpolates variables
 */
export function loadPrompt(
  filename: string,
  variables?: Record<string, string | number>
): string {
  const promptPath = join(process.cwd(), 'src/lib/prompts', filename);
  let content = readFileSync(promptPath, 'utf-8');

  // Interpolate variables if provided
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    });
  }

  return content;
}

/**
 * Splits a prompt file into system and user sections
 */
export function parsePrompt(content: string): { system: string; user?: string } {
  const sections = content.split('---').map(s => s.trim());

  if (sections.length === 1) {
    return { system: sections[0] };
  }

  // Extract content after the heading
  const system = sections[0].replace(/^#[^\n]+\n+/, '').trim();
  const user = sections[1] ? sections[1].replace(/^#[^\n]+\n+/, '').trim() : undefined;

  return { system, user };
}

/**
 * Loads and parses a prompt file with variable interpolation
 */
export function getPrompt(
  filename: string,
  variables?: Record<string, string | number>
): { system: string; user?: string } {
  const content = loadPrompt(filename, variables);
  return parsePrompt(content);
}
