export { type MathNode, parseTex, TexParseError } from './parse';
export { speak, speakTex } from './spoken';

/** Splits paragraph text into plain and inline-math ($…$) segments. */
export function splitInlineMath(text: string): { type: 'text' | 'math'; value: string }[] {
  const parts: { type: 'text' | 'math'; value: string }[] = [];
  const pattern = /\$([^$]+)\$/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) parts.push({ type: 'text', value: text.slice(last, match.index) });
    parts.push({ type: 'math', value: match[1] ?? '' });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
  return parts;
}
