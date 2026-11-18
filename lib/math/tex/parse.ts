/**
 * Parser for the small LaTeX subset used by lesson content.
 *
 * It only builds a layout tree for display; nothing is evaluated. Unknown
 * commands throw TexParseError so authoring mistakes are caught by the
 * content tests instead of rendering wrongly.
 *
 * Supported: grouping {…}, ^ and _, \frac/\dfrac/\tfrac, \sqrt[n]{…}, \int,
 * \sum, \iint, \iiint and \lim (limits stacked above and below), \bar/\overline,
 * \underbrace{…}_{label}, function names (\sin, \cos, \tan, \sec, \csc, \cot,
 * \ln, \log, \exp …), Greek letters, common relations/operators, \nabla,
 * \mathbf{…} (bold, e.g. the unit vectors i, j, k), a determinant or matrix
 * (\begin{vmatrix} a & b \\ c & d \end{vmatrix}, also pmatrix),
 * \left/\right and \big/\Big (sizes ignored), \text/\mathrm, spacing
 * commands, and digits/letters/punctuation.
 */

export type MathNode =
  | { kind: 'row'; children: MathNode[] }
  | { kind: 'ident'; text: string; name?: string }
  | { kind: 'number'; text: string }
  | { kind: 'op'; text: string }
  | { kind: 'fn'; name: string }
  | { kind: 'text'; text: string }
  | { kind: 'space'; em: number }
  | { kind: 'sup'; base: MathNode; sup: MathNode }
  | { kind: 'sub'; base: MathNode; sub: MathNode }
  | { kind: 'subsup'; base: MathNode; sub: MathNode; sup: MathNode }
  | { kind: 'frac'; num: MathNode; den: MathNode }
  | { kind: 'sqrt'; body: MathNode; index?: MathNode }
  | { kind: 'integral' }
  /** A large operator such as ∑; its limits are stacked above and below it. */
  | { kind: 'largeop'; text: string }
  /** x̄: a bar over the body. */
  | { kind: 'bar'; body: MathNode }
  /** \underbrace{body}_{label}: a brace under the body, with a label below it. */
  | { kind: 'under'; body: MathNode; label: MathNode }
  /** \mathbf{body}: bold (vectors, such as the unit vectors i, j and k). */
  | { kind: 'bold'; body: MathNode }
  /** A determinant (vertical bars) or a matrix (round brackets): rows of cells. */
  | { kind: 'matrix'; rows: MathNode[][]; delimiter: 'bars' | 'parens' };

export class TexParseError extends Error {
  constructor(
    message: string,
    readonly tex: string,
  ) {
    super(`${message} in "${tex}"`);
    this.name = 'TexParseError';
  }
}

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'sec',
  'csc',
  'cot',
  'sinh',
  'cosh',
  'tanh',
  'arcsin',
  'arccos',
  'arctan',
  'ln',
  'log',
  'exp',
  'lim',
]);

const GREEK: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  theta: 'θ',
  lambda: 'λ',
  mu: 'μ',
  pi: 'π',
  sigma: 'σ',
  phi: 'φ',
  omega: 'ω',
  Delta: 'Δ',
};

const SYMBOLS: Record<string, string> = {
  cdot: '·',
  times: '×',
  div: '÷',
  pm: '±',
  mp: '∓',
  neq: '≠',
  ne: '≠',
  le: '≤',
  leq: '≤',
  ge: '≥',
  geq: '≥',
  approx: '≈',
  equiv: '≡',
  to: '→',
  rightarrow: '→',
  Rightarrow: '⇒',
  implies: '⇒',
  iff: '⇔',
  infty: '∞',
  ldots: '…',
  cdots: '⋯',
  prime: '′',
  lvert: '|',
  rvert: '|',
  vert: '|',
  mid: '|',
  lbrace: '{',
  rbrace: '}',
  langle: '⟨',
  rangle: '⟩',
  circ: '∘',
  partial: '∂',
  nabla: '∇',
  ast: '∗',
  in: '∈',
  dots: '…',
};

const SPACES: Record<string, number> = { ',': 0.17, ':': 0.22, ';': 0.28, '!': 0, quad: 1, qquad: 2 };

const FRACTIONS = new Set(['frac', 'dfrac', 'tfrac']);
/** Delimiter sizing commands: ignored; the delimiter that follows is kept. */
const SIZES = new Set(['big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr']);
const TEXT_COMMANDS = new Set(['text', 'mathrm', 'operatorname', 'textrm']);

type Token =
  | { t: 'cmd'; v: string }
  | { t: 'open' }
  | { t: 'close' }
  | { t: 'sup' }
  | { t: 'sub' }
  | { t: 'num'; v: string }
  | { t: 'letter'; v: string }
  | { t: 'char'; v: string }
  /** Whitespace: ignored in maths, kept inside \text{…}. */
  | { t: 'ws' };

function tokenize(tex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < tex.length) {
    const ch = tex.charAt(i);
    if (/\s/.test(ch)) {
      if (tokens[tokens.length - 1]?.t !== 'ws') tokens.push({ t: 'ws' });
      i++;
    } else if (ch === '\\') {
      const rest = tex.slice(i + 1);
      const word = /^[A-Za-z]+/.exec(rest);
      if (word) {
        tokens.push({ t: 'cmd', v: word[0] });
        i += 1 + word[0].length;
      } else if (rest.length > 0) {
        tokens.push({ t: 'cmd', v: rest.charAt(0) });
        i += 2;
      } else {
        throw new TexParseError('Trailing backslash', tex);
      }
    } else if (ch === '{') {
      tokens.push({ t: 'open' });
      i++;
    } else if (ch === '}') {
      tokens.push({ t: 'close' });
      i++;
    } else if (ch === '^') {
      tokens.push({ t: 'sup' });
      i++;
    } else if (ch === '_') {
      tokens.push({ t: 'sub' });
      i++;
    } else if (/[0-9.]/.test(ch)) {
      const num = /^[0-9]*\.?[0-9]+|^[0-9]+/.exec(tex.slice(i));
      const text = num ? num[0] : ch;
      tokens.push({ t: 'num', v: text });
      i += text.length;
    } else if (/[A-Za-z]/.test(ch)) {
      tokens.push({ t: 'letter', v: ch });
      i++;
    } else {
      tokens.push({ t: 'char', v: ch });
      i++;
    }
  }
  return tokens;
}

class Parser {
  private pos = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly tex: string,
  ) {}

  parse(): MathNode {
    const row = this.parseRow(false);
    if (this.peek()) throw new TexParseError('Unexpected "}"', this.tex);
    return row;
  }

  private skipWhitespace(): void {
    while (this.tokens[this.pos]?.t === 'ws') this.pos++;
  }

  private peek(): Token | undefined {
    this.skipWhitespace();
    return this.tokens[this.pos];
  }

  private next(): Token {
    this.skipWhitespace();
    const token = this.tokens[this.pos++];
    if (!token) throw new TexParseError('Unexpected end of expression', this.tex);
    return token;
  }

  /** Next token including whitespace (used inside \text{…}). */
  private nextRaw(): Token {
    const token = this.tokens[this.pos++];
    if (!token) throw new TexParseError('Unexpected end of expression', this.tex);
    return token;
  }

  private parseRow(insideGroup: boolean): MathNode {
    const children: MathNode[] = [];
    while (this.peek()) {
      const token = this.peek();
      if (token?.t === 'close') {
        if (!insideGroup) break;
        this.pos++;
        return { kind: 'row', children };
      }
      const atom = this.parseAtom();
      if (atom) children.push(this.parseScripts(atom));
    }
    if (insideGroup) throw new TexParseError('Missing "}"', this.tex);
    return { kind: 'row', children };
  }

  /** A required argument: {group} or a single token (only one digit of a number). */
  private parseArgument(): MathNode {
    const token = this.peek();
    if (!token) throw new TexParseError('Missing argument', this.tex);
    if (token.t === 'open') {
      this.pos++;
      return this.parseRow(true);
    }
    if (token.t === 'num' && token.v.length > 1) {
      // x^23 means x^{2}3 in LaTeX: take one character.
      this.tokens[this.pos] = { t: 'num', v: token.v.slice(1) };
      return { kind: 'number', text: token.v.charAt(0) };
    }
    const atom = this.parseAtom();
    if (!atom) throw new TexParseError('Missing argument', this.tex);
    return atom;
  }

  private parseScripts(base: MathNode): MathNode {
    let sup: MathNode | undefined;
    let sub: MathNode | undefined;
    for (;;) {
      const token = this.peek();
      if (token?.t === 'sup' && !sup) {
        this.pos++;
        sup = this.parseArgument();
      } else if (token?.t === 'sub' && !sub) {
        this.pos++;
        sub = this.parseArgument();
      } else if (token?.t === 'char' && token.v === "'") {
        this.pos++;
        base = { kind: 'row', children: [base, { kind: 'op', text: '′' }] };
      } else {
        break;
      }
    }
    if (sup && sub) return { kind: 'subsup', base, sub, sup };
    if (sup) return { kind: 'sup', base, sup };
    if (sub) return { kind: 'sub', base, sub };
    return base;
  }

  private parseAtom(): MathNode | null {
    const token = this.next();
    switch (token.t) {
      case 'open':
        return this.parseRow(true);
      case 'close':
        throw new TexParseError('Unexpected "}"', this.tex);
      case 'sup':
      case 'sub':
        throw new TexParseError('Script without a base', this.tex);
      case 'num':
        return { kind: 'number', text: token.v };
      case 'letter':
        return { kind: 'ident', text: token.v };
      case 'char':
        return { kind: 'op', text: token.v === '-' ? '−' : token.v === '*' ? '·' : token.v };
      case 'cmd':
        return this.parseCommand(token.v);
      case 'ws':
        return null;
    }
  }

  private parseCommand(name: string): MathNode | null {
    if (FRACTIONS.has(name)) {
      const num = this.parseArgument();
      const den = this.parseArgument();
      return { kind: 'frac', num, den };
    }
    if (name === 'sqrt') {
      let index: MathNode | undefined;
      const token = this.peek();
      if (token?.t === 'char' && token.v === '[') {
        this.pos++;
        const children: MathNode[] = [];
        while (!(this.peek()?.t === 'char' && (this.peek() as { v: string }).v === ']')) {
          const atom = this.parseAtom();
          if (atom) children.push(atom);
        }
        this.pos++;
        index = { kind: 'row', children };
      }
      return { kind: 'sqrt', body: this.parseArgument(), index };
    }
    if (name === 'int') return { kind: 'integral' };
    if (name === 'sum') return { kind: 'largeop', text: '∑' };
    // Double and triple integrals take their region below the sign, as in the Chapter 5 notes.
    if (name === 'iint') return { kind: 'largeop', text: '∬' };
    if (name === 'iiint') return { kind: 'largeop', text: '∭' };
    if (name === 'bar' || name === 'overline') return { kind: 'bar', body: this.parseArgument() };
    if (name === 'underbrace') {
      const body = this.parseArgument();
      if (this.peek()?.t !== 'sub')
        throw new TexParseError('\\underbrace needs a label: \\underbrace{…}_{…}', this.tex);
      this.pos++;
      return { kind: 'under', body, label: this.parseArgument() };
    }
    if (name === 'mathbf') return { kind: 'bold', body: this.parseArgument() };
    if (name === 'begin') return this.parseEnvironment();
    if (FUNCTIONS.has(name)) return { kind: 'fn', name };
    if (GREEK[name]) return { kind: 'ident', text: GREEK[name], name };
    if (SYMBOLS[name]) return { kind: 'op', text: SYMBOLS[name] };
    if (name in SPACES) return { kind: 'space', em: SPACES[name] ?? 0 };
    if (name === '{' || name === '}' || name === '|' || name === '%' || name === '&') return { kind: 'op', text: name };
    if (name === 'left' || name === 'right') {
      // Delimiter sizing is not needed for the layout engine; keep the delimiter itself.
      const delimiter = this.next();
      if (delimiter.t === 'char') return { kind: 'op', text: delimiter.v === '.' ? '' : delimiter.v };
      // "\left." (the invisible delimiter, e.g. in an evaluation bar) is lexed as a number token.
      if (delimiter.t === 'num' && delimiter.v.startsWith('.')) {
        if (delimiter.v.length > 1) {
          // "\left.5" lexes as ".5": give back the digits after the dot.
          this.pos--;
          this.tokens[this.pos] = { t: 'num', v: delimiter.v.slice(1) };
        }
        return { kind: 'op', text: '' };
      }
      if (delimiter.t === 'cmd') return this.parseCommand(delimiter.v);
      throw new TexParseError(`Bad delimiter after \\${name}`, this.tex);
    }
    if (TEXT_COMMANDS.has(name)) {
      const start = this.peek();
      if (start?.t !== 'open') throw new TexParseError(`\\${name} needs {…}`, this.tex);
      this.pos++;
      let text = '';
      let depth = 1;
      while (depth > 0) {
        const token = this.nextRaw();
        if (token.t === 'open') depth++;
        else if (token.t === 'close') depth--;
        if (depth === 0) break;
        if (token.t === 'letter' || token.t === 'num' || token.t === 'char') text += token.v;
        else if (token.t === 'ws' || (token.t === 'cmd' && SPACES[token.v] !== undefined)) text += ' ';
      }
      return { kind: 'text', text };
    }
    if (name === 'displaystyle' || name === 'limits' || SIZES.has(name)) return null;
    throw new TexParseError(`Unsupported command \\${name}`, this.tex);
  }

  /** The letters of a {name} group (an environment name). */
  private parseName(): string {
    if (this.next().t !== 'open') throw new TexParseError('Missing {name}', this.tex);
    let name = '';
    for (;;) {
      const token = this.next();
      if (token.t === 'close') return name;
      if (token.t !== 'letter') throw new TexParseError('Bad environment name', this.tex);
      name += token.v;
    }
  }

  /** \begin{vmatrix} a & b \\ c & d \end{vmatrix}: cells separated by &, rows by \\. */
  private parseEnvironment(): MathNode {
    const name = this.parseName();
    const delimiter = ENVIRONMENTS[name];
    if (!delimiter) throw new TexParseError(`Unsupported environment ${name}`, this.tex);
    const rows: MathNode[][] = [];
    let cells: MathNode[] = [];
    let cell: MathNode[] = [];
    const endCell = () => {
      cells.push({ kind: 'row', children: cell });
      cell = [];
    };
    for (;;) {
      const token = this.peek();
      if (!token) throw new TexParseError(`Missing \\end{${name}}`, this.tex);
      if (token.t === 'char' && token.v === '&') {
        this.pos++;
        endCell();
      } else if (token.t === 'cmd' && token.v === '\\') {
        this.pos++;
        endCell();
        rows.push(cells);
        cells = [];
      } else if (token.t === 'cmd' && token.v === 'end') {
        this.pos++;
        if (this.parseName() !== name) throw new TexParseError(`Mismatched \\end for ${name}`, this.tex);
        endCell();
        rows.push(cells);
        return { kind: 'matrix', rows, delimiter };
      } else {
        const atom = this.parseAtom();
        if (atom) cell.push(this.parseScripts(atom));
      }
    }
  }
}

const ENVIRONMENTS: Record<string, 'bars' | 'parens'> = { vmatrix: 'bars', pmatrix: 'parens' };

/** Parses a TeX string into a layout tree. Throws TexParseError on unsupported input. */
export function parseTex(tex: string): MathNode {
  return new Parser(tokenize(tex), tex).parse();
}
