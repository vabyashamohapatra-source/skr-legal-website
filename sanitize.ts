import React from 'react';
import { marked } from 'marked';

/**
 * Converts stored content (which could be Markdown from existing posts or HTML from the rich text editor)
 * into clean HTML for the visual editor.
 */
export function convertStoredContentToHtml(content: string): string {
  if (!content || !content.trim()) return '<p></p>';
  const trimmed = content.trim();

  // If it's already HTML block elements (from previous rich-text saves)
  if (
    trimmed.startsWith('<h1') ||
    trimmed.startsWith('<h2') ||
    trimmed.startsWith('<h3') ||
    trimmed.startsWith('<h4') ||
    trimmed.startsWith('<p') ||
    trimmed.startsWith('<div') ||
    trimmed.startsWith('<blockquote')
  ) {
    return content;
  }

  // Otherwise convert legacy markdown into clean HTML
  try {
    return marked.parse(content) as string;
  } catch (e) {
    return `<p>${content}</p>`;
  }
}

/**
 * Predefined colors for the SKR Legal editor, featuring the signature Gold accent.
 */
export const PRESET_COLORS = [
  { label: 'SKR Gold', value: '#d4af37', bg: '#d4af37', border: '#d4af37', isPrimary: true },
  { label: 'White', value: '#ffffff', bg: '#ffffff', border: '#ffffff' },
  { label: 'Silver', value: '#9ca3af', bg: '#9ca3af', border: '#9ca3af' },
  { label: 'Amber', value: '#f59e0b', bg: '#f59e0b', border: '#f59e0b' },
  { label: 'Crimson', value: '#ef4444', bg: '#ef4444', border: '#ef4444' },
  { label: 'Emerald', value: '#10b981', bg: '#10b981', border: '#10b981' },
  { label: 'Sky Blue', value: '#38bdf8', bg: '#38bdf8', border: '#38bdf8' },
];

/**
 * Validates that a given CSS color is safe to render and prevents CSS injection.
 */
export function isSafeColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  const trimmed = color.trim().toLowerCase();

  // Hex colors (#fff, #ffffff, #ffffffff)
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(trimmed)) {
    return true;
  }

  // rgb / rgba colors: rgb(212, 175, 55) or rgba(212, 175, 55, 0.9)
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(trimmed)) {
    return true;
  }

  // hsl / hsla colors
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(\s*,\s*(0|1|0?\.\d+))?\s*\)$/.test(trimmed)) {
    return true;
  }

  // Standard safe web named colors
  const safeNamed = [
    'gold', 'white', 'black', 'gray', 'silver', 'red', 'green', 'blue',
    'yellow', 'cyan', 'magenta', 'orange', 'purple', 'emerald', 'amber',
    'navy', 'teal', 'maroon', 'olive', 'coral', 'crimson', 'khaki'
  ];
  if (safeNamed.includes(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Sanitizes markdown/HTML blog content:
 * - Strips dangerous tags (script, iframe, object, embed, style, form, svg, math, meta, link, base)
 * - Strips all on* event handler attributes
 * - Replaces javascript: or data: in href/src
 * - Strictly verifies style attributes on tags to ONLY permit safe 'color: <safeColor>'
 */
export function sanitizeBlogContent(content: string): string {
  if (!content || typeof content !== 'string') return '';

  let clean = content;

  // 1. Remove dangerous paired tags and their enclosed content completely
  clean = clean.replace(/<\s*(script|style|iframe|object|embed|form|svg|math)[^>]*>.*?<\s*\/\s*\1\s*>/gis, '');

  // 2. Remove any remaining self-closing or unclosed dangerous tags
  clean = clean.replace(/<\s*(script|style|iframe|object|embed|form|svg|math|meta|link|base)[^>]*\/?>/gis, '');

  // 3. Remove all on* event handlers (e.g. onerror, onload, onclick)
  clean = clean.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gis, '');

  // 4. Disallow javascript: and data: URIs in href and src
  clean = clean.replace(/(href|src)\s*=\s*["']\s*(?:javascript|data):[^"']*["']/gis, '$1="#"');

  // 5. Sanitize style attributes to ONLY keep valid 'color: <safe-color>'
  clean = clean.replace(/style\s*=\s*(["'])(.*?)\1/gis, (_match, _quote, styleVal) => {
    const colorMatch = styleVal.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (colorMatch && isSafeColor(colorMatch[1])) {
      return `style="color: ${colorMatch[1].trim()}"`;
    }
    return '';
  });

  return clean;
}

/**
 * React-Markdown custom component overrides for extra security defense-in-depth:
 * - span: safely parses style and validates color
 * - blocks any execution of script, iframe, object, embed, form
 */
export const safeMarkdownComponents = {
  span: ({ style, children, node, ...props }: any) => {
    let safeColor: string | undefined = undefined;

    if (style) {
      if (typeof style === 'string') {
        const match = style.match(/color\s*:\s*([^;]+)/i);
        if (match && isSafeColor(match[1].trim())) {
          safeColor = match[1].trim();
        }
      } else if (typeof style === 'object' && style.color) {
        if (isSafeColor(String(style.color))) {
          safeColor = String(style.color);
        }
      }
    }

    return React.createElement(
      'span',
      {
        ...props,
        style: safeColor ? { color: safeColor } : undefined,
      },
      children
    );
  },
  script: () => null,
  iframe: () => null,
  object: () => null,
  embed: () => null,
  form: () => null,
};

/**
 * Applies a text color to a selected range of text inside the editor.
 * Works uniformly for normal paragraphs, headings (H1, H2, H3, H4), and inline phrases.
 */
export function applyColorToText(
  content: string,
  start: number,
  end: number,
  color: string
): { newContent: string; newStart: number; newEnd: number } {
  const safeCol = isSafeColor(color) ? color : '#d4af37';
  const text = content || '';

  // If no text is selected (cursor only), insert a formatted placeholder and select its text
  if (start === end) {
    const placeholder = `<span style="color: ${safeCol}">colored text</span>`;
    const newContent = text.substring(0, start) + placeholder + text.substring(end);
    const prefixLen = `<span style="color: ${safeCol}">`.length;
    return {
      newContent,
      newStart: start + prefixLen,
      newEnd: start + prefixLen + 'colored text'.length,
    };
  }

  const before = text.substring(0, start);
  let selected = text.substring(start, end);
  const after = text.substring(end);

  // Strip any internal color spans from the selected text to prevent redundant nesting
  selected = selected.replace(/<span\s+style=["']color:\s*[^"']*["']>(.*?)<\/span>/gis, '$1');

  // Check if the selection is already completely inside an existing color span:
  const lastOpenSpan = before.lastIndexOf('<span style="color:');
  const lastCloseSpan = before.lastIndexOf('</span>');
  const nextCloseSpan = after.indexOf('</span>');
  const nextOpenSpan = after.indexOf('<span style="color:');

  const isInsideSpan =
    lastOpenSpan > -1 &&
    (lastCloseSpan === -1 || lastOpenSpan > lastCloseSpan) &&
    nextCloseSpan > -1 &&
    (nextOpenSpan === -1 || nextCloseSpan < nextOpenSpan);

  if (isInsideSpan) {
    const spanTagEnd = before.indexOf('>', lastOpenSpan);
    if (spanTagEnd > -1) {
      const fullSpanTag = before.substring(lastOpenSpan, spanTagEnd + 1);
      const preText = before.substring(spanTagEnd + 1);
      const postText = after.substring(0, nextCloseSpan);
      const restBefore = before.substring(0, lastOpenSpan);
      const restAfter = after.substring(nextCloseSpan + 7);

      let result = restBefore;
      if (preText) result += fullSpanTag + preText + '</span>';
      result += `<span style="color: ${safeCol}">${selected}</span>`;
      if (postText) result += fullSpanTag + postText + '</span>';
      result += restAfter;

      const newStart =
        restBefore.length +
        (preText ? fullSpanTag.length + preText.length + 7 : 0) +
        `<span style="color: ${safeCol}">`.length;
      const newEnd = newStart + selected.length;

      return {
        newContent: result,
        newStart,
        newEnd,
      };
    }
  }

  const replacement = `<span style="color: ${safeCol}">${selected}</span>`;
  return {
    newContent: before + replacement + after,
    newStart: start,
    newEnd: start + replacement.length,
  };
}

/**
 * Removes color from the selected range of text, restoring it to the default text color.
 * If the selection or cursor is inside an existing color span, it cleanly un-wraps the color span.
 */
export function removeColorFromText(
  content: string,
  start: number,
  end: number
): { newContent: string; newStart: number; newEnd: number } {
  const text = content || '';
  if (!text) return { newContent: '', newStart: 0, newEnd: 0 };

  const before = text.substring(0, start);
  const selected = text.substring(start, end);
  const after = text.substring(end);

  // Case 1: The selection contains color spans
  if (start < end && /<span\s+style=["']color:\s*[^"']*["']>(.*?)<\/span>/i.test(selected)) {
    const stripped = selected.replace(/<span\s+style=["']color:\s*[^"']*["']>(.*?)<\/span>/gis, '$1');
    return {
      newContent: before + stripped + after,
      newStart: start,
      newEnd: start + stripped.length,
    };
  }

  // Case 2: The selection (or cursor) is inside an enclosing color span
  const lastOpenSpan = before.lastIndexOf('<span style="color:');
  const lastCloseSpan = before.lastIndexOf('</span>');
  const nextCloseSpan = after.indexOf('</span>');
  const nextOpenSpan = after.indexOf('<span style="color:');

  const isInsideSpan =
    lastOpenSpan > -1 &&
    (lastCloseSpan === -1 || lastOpenSpan > lastCloseSpan) &&
    nextCloseSpan > -1 &&
    (nextOpenSpan === -1 || nextCloseSpan < nextOpenSpan);

  if (isInsideSpan) {
    const spanTagEnd = before.indexOf('>', lastOpenSpan);
    if (spanTagEnd > -1) {
      const fullSpanTag = before.substring(lastOpenSpan, spanTagEnd + 1);
      const preText = before.substring(spanTagEnd + 1);
      const postText = after.substring(0, nextCloseSpan);
      const restBefore = before.substring(0, lastOpenSpan);
      const restAfter = after.substring(nextCloseSpan + 7);

      let result = restBefore;
      if (preText) result += fullSpanTag + preText + '</span>';
      result += selected;
      if (postText) result += fullSpanTag + postText + '</span>';
      result += restAfter;

      const newStart =
        restBefore.length + (preText ? fullSpanTag.length + preText.length + 7 : 0);
      const newEnd = newStart + selected.length;

      return {
        newContent: result,
        newStart,
        newEnd,
      };
    }
  }

  return {
    newContent: text,
    newStart: start,
    newEnd: end,
  };
}
