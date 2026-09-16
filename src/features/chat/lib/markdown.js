// #genai: Markdown subset parser for LLM narration.
//
// Gemini answers in Markdown (`**bold**`, bullet lists, the occasional heading), so the raw string
// cannot go straight into a `<Text>`. This turns it into blocks and inline spans that the renderer
// maps onto the Statement type scale. It is deliberately a subset — no tables, no images, no HTML —
// and it never throws: anything it does not recognise stays literal text.

const HEADING = /^ {0,3}(#{1,6})\s+(.*)$/;
const BULLET = /^ {0,3}[-*•]\s+(.*)$/;
const ORDERED = /^ {0,3}(\d{1,3})[.)]\s+(.*)$/;
const QUOTE = /^ {0,3}>\s?(.*)$/;
const DIVIDER = /^ {0,3}([-*_])\s*(\1\s*){2,}$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

// Order matters: the three-marker forms must be tried before the two- and one-marker ones.
const INLINE_PATTERN = [
  '(\\*\\*\\*|___)([\\s\\S]+?)\\1', // strong + emphasis
  '(\\*\\*|__)([\\s\\S]+?)\\3', // strong
  // Emphasis must close on a word boundary, so arithmetic like `2*3` stays literal.
  '(\\*|_)(\\S[\\s\\S]*?)\\5(?!\\w)',
  '`([^`]+)`', // inline code
  '\\[([^\\]]+)\\]\\(([^)\\s]+)\\)', // link
].join('|');

function unescapeMarkdown(text) {
  return text.replace(/\\([\\`*_[\]()#>-])/g, '$1');
}

function flagged(spans, flag) {
  return spans.map((span) => ({ ...span, [flag]: true }));
}

/**
 * Splits one line of text into styled spans.
 *
 * Returns at least one span so the renderer never has to special-case empty output.
 */
export function parseInline(text) {
  const spans = [];
  let cursor = 0;
  let match;

  // A fresh regex per call: this function recurses into the text it just matched, and a shared
  // global regex would have its `lastIndex` reset by the inner call and never finish the outer scan.
  const inline = new RegExp(INLINE_PATTERN, 'g');
  while ((match = inline.exec(text)) !== null) {
    // `snake_case` and `2*3` are not emphasis: a marker glued to the end of a word is literal.
    // Hermes cannot be relied on for lookbehind, so the preceding character is checked by hand.
    if (match[5] !== undefined && /\w/.test(text[match.index - 1] ?? '')) continue;

    if (match.index > cursor) {
      spans.push({ text: unescapeMarkdown(text.slice(cursor, match.index)) });
    }

    if (match[2] !== undefined) {
      spans.push(...flagged(flagged(parseInline(match[2]), 'strong'), 'emphasis'));
    } else if (match[4] !== undefined) {
      spans.push(...flagged(parseInline(match[4]), 'strong'));
    } else if (match[6] !== undefined) {
      spans.push(...flagged(parseInline(match[6]), 'emphasis'));
    } else if (match[7] !== undefined) {
      spans.push({ text: match[7], code: true });
    } else if (match[8] !== undefined) {
      spans.push({ text: unescapeMarkdown(match[8]), href: match[9] });
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    spans.push({ text: unescapeMarkdown(text.slice(cursor)) });
  }

  return spans.length > 0 ? spans : [{ text: unescapeMarkdown(text) }];
}

/**
 * A half-typed marker is invisible in a finished answer but flickers as raw asterisks while the
 * response streams in, so an unterminated run at the very end is dropped mid-stream.
 */
export function trimDanglingMarkers(text) {
  let output = text.replace(/(?:\*{1,3}|_{1,3})\s*$/, '');
  const backticks = (output.match(/`/g) ?? []).length;
  if (backticks % 2 === 1) output = output.slice(0, output.lastIndexOf('`'));
  return output;
}

/**
 * Parses Markdown into renderable blocks.
 *
 * Block shapes: `{ type: 'paragraph' | 'heading' | 'quote', ... }`, `{ type: 'list', ordered, items }`,
 * `{ type: 'code', text }`, `{ type: 'divider' }`.
 */
export function parseMarkdown(text) {
  const blocks = [];
  const lines = (text ?? '').replace(/\r\n?/g, '\n').split('\n');

  let paragraph = [];
  let list = null;

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'paragraph', spans: parseInline(paragraph.join(' ').trim()) });
    paragraph = [];
  };

  const closeList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  const closeAll = () => {
    closeParagraph();
    closeList();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (FENCE.test(line)) {
      closeAll();
      const fence = line.match(FENCE)[1];
      const body = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith(fence)) {
        body.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }

    if (line.trim() === '') {
      closeAll();
      continue;
    }

    if (DIVIDER.test(line)) {
      closeAll();
      blocks.push({ type: 'divider' });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      closeAll();
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        spans: parseInline(heading[2].replace(/\s*#+\s*$/, '')),
      });
      continue;
    }

    const quote = line.match(QUOTE);
    if (quote) {
      closeAll();
      blocks.push({ type: 'quote', spans: parseInline(quote[1]) });
      continue;
    }

    const ordered = line.match(ORDERED);
    const bullet = ordered ? null : line.match(BULLET);
    if (ordered || bullet) {
      closeParagraph();
      const item = {
        marker: ordered ? `${ordered[1]}.` : '·',
        spans: parseInline(ordered ? ordered[2] : bullet[1]),
      };
      const isOrdered = Boolean(ordered);
      if (list && list.ordered === isOrdered) list.items.push(item);
      else {
        closeList();
        list = { type: 'list', ordered: isOrdered, items: [item] };
      }
      continue;
    }

    // A plain line under a list item continues that item rather than starting a paragraph.
    if (list) {
      const last = list.items[list.items.length - 1];
      last.spans = last.spans.concat(parseInline(` ${line.trim()}`));
      continue;
    }

    paragraph.push(line.trim());
  }

  closeAll();
  return blocks;
}
