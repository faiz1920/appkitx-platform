/*
 * Scientific calculator engine.
 *
 * A small recursive-descent parser evaluates a strict expression grammar:
 *   expression  := term (("+" | "-") term)*
 *   term        := unary (("*" | "/") unary)*
 *   unary       := ("+" | "-") unary | power
 *   power       := postfix ("^" unary)?
 *   postfix     := primary ("!" | "%")*
 *   primary     := number | constant | "(" expression ")" | function "(" args ")"
 *
 * The parser never uses eval/new Function and returns a tagged result rather
 * than throwing at the API boundary. Internal precision stays in doubles;
 * display formatting and history serialization are separate helpers.
 */

export type AngleMode = "degrees" | "radians";

export type ScientificIssue =
  | "empty"
  | "invalid"
  | "limits"
  | "division-by-zero"
  | "domain"
  | "overflow"
  | "factorial-range";

export type ScientificEvaluation =
  { ok: true; value: number } | { ok: false; issue: ScientificIssue };

export const MAX_EXPRESSION_LENGTH = 500;
export const MAX_NESTING_DEPTH = 32;
export const MAX_FACTORIAL = 170;
export const MAX_ROOT_INDEX = 1000;

export const SCIENTIFIC_FUNCTION_KEYS = [
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "ln",
  "log",
  "exp",
  "sqrt",
  "cbrt",
  "root",
  "abs",
  "reciprocal",
  "square",
  "cube",
  "power",
  "factorial",
  "percent",
  "pi",
  "e",
] as const;

export type ScientificFunctionKey = (typeof SCIENTIFIC_FUNCTION_KEYS)[number];

export const SCIENTIFIC_CONTROL_KEYS = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "openParenthesis",
  "closeParenthesis",
  "comma",
  "decimal",
  "sign",
  "clear",
  "backspace",
  "equals",
] as const;

export type ScientificControlKey = (typeof SCIENTIFIC_CONTROL_KEYS)[number];

class ScientificError extends Error {
  readonly issue: ScientificIssue;

  constructor(issue: ScientificIssue) {
    super(issue);
    this.issue = issue;
  }
}

interface Token {
  type:
    | "number"
    | "identifier"
    | "operator"
    | "lparen"
    | "rparen"
    | "comma"
    | "eof";
  value: string;
}

const NORMALIZATIONS: ReadonlyArray<[RegExp, string]> = [
  [/×/g, "*"],
  [/÷/g, "/"],
  [/[−–]/g, "-"],
  [/π/g, "pi"],
  [/√/g, "sqrt"],
];

function normalizeExpression(expression: string): string {
  return NORMALIZATIONS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    expression,
  );
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index] ?? "";

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(character)) {
      const start = index;
      let digits = 0;

      while (
        index < expression.length &&
        /[0-9]/.test(expression[index] ?? "")
      ) {
        digits += 1;
        index += 1;
      }

      if (expression[index] === ".") {
        index += 1;
        while (
          index < expression.length &&
          /[0-9]/.test(expression[index] ?? "")
        ) {
          digits += 1;
          index += 1;
        }
      }

      if (digits === 0) throw new ScientificError("invalid");

      const exponent = /[eE]/.exec(expression[index] ?? "");
      if (exponent !== null) {
        const exponentStart = index;
        index += 1;
        if (/[+-]/.test(expression[index] ?? "")) index += 1;
        let exponentDigits = 0;
        while (
          index < expression.length &&
          /[0-9]/.test(expression[index] ?? "")
        ) {
          exponentDigits += 1;
          index += 1;
        }
        if (exponentDigits === 0) index = exponentStart;
      }

      const raw = expression.slice(start, index);
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new ScientificError("overflow");
      tokens.push({ type: "number", value: String(value) });
      continue;
    }

    if (/[A-Za-z]/.test(character)) {
      const start = index;
      while (
        index < expression.length &&
        /[A-Za-z0-9]/.test(expression[index] ?? "")
      ) {
        index += 1;
      }
      tokens.push({
        type: "identifier",
        value: expression.slice(start, index).toLowerCase(),
      });
      continue;
    }

    if ("+-*/^!%".includes(character)) {
      tokens.push({ type: "operator", value: character });
      index += 1;
      continue;
    }

    if (character === "(") {
      tokens.push({ type: "lparen", value: character });
      index += 1;
      continue;
    }

    if (character === ")") {
      tokens.push({ type: "rparen", value: character });
      index += 1;
      continue;
    }

    if (character === ",") {
      tokens.push({ type: "comma", value: character });
      index += 1;
      continue;
    }

    throw new ScientificError("invalid");
  }

  tokens.push({ type: "eof", value: "" });
  return tokens;
}

function finite(value: number): number {
  if (Number.isNaN(value)) throw new ScientificError("domain");
  if (!Number.isFinite(value)) throw new ScientificError("overflow");
  return Object.is(value, -0) ? 0 : value;
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > MAX_FACTORIAL) {
    throw new ScientificError("factorial-range");
  }

  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }
  return finite(result);
}

function toRadians(value: number, angleMode: AngleMode): number {
  return angleMode === "degrees" ? (value * Math.PI) / 180 : value;
}

function fromRadians(value: number, angleMode: AngleMode): number {
  return angleMode === "degrees" ? (value * 180) / Math.PI : value;
}

/*
 * Trigonometry at exact quadrant boundaries leaves binary residues such as
 * cos(90°) = 6.12e-17. Snap only results that are within floating-point noise
 * of 0, 1, or -1; ordinary values are never rounded here.
 */
function snapTrig(value: number): number {
  if (Math.abs(value) < 1e-14) return 0;
  if (Math.abs(value - 1) < 1e-14) return 1;
  if (Math.abs(value + 1) < 1e-14) return -1;
  return value;
}

function root(index: number, value: number): number {
  if (
    !Number.isInteger(index) ||
    index < 2 ||
    index > MAX_ROOT_INDEX ||
    !Number.isFinite(value)
  ) {
    throw new ScientificError("domain");
  }
  if (value === 0) return 0;
  if (value < 0 && index % 2 === 0) throw new ScientificError("domain");

  const magnitude = Math.pow(Math.abs(value), 1 / index);
  return finite(value < 0 ? -magnitude : magnitude);
}

class Parser {
  private readonly tokens: Token[];
  private readonly angleMode: AngleMode;
  private position = 0;
  private depth = 0;

  constructor(tokens: Token[], angleMode: AngleMode) {
    this.tokens = tokens;
    this.angleMode = angleMode;
  }

  parse(): number {
    const value = this.parseExpression();
    if (this.current().type !== "eof") throw new ScientificError("invalid");
    return finite(value);
  }

  private current(): Token {
    return this.tokens[this.position] ?? { type: "eof", value: "" };
  }

  private advance(): Token {
    const token = this.current();
    this.position += 1;
    return token;
  }

  private expect(type: Token["type"]): Token {
    const token = this.current();
    if (token.type !== type) throw new ScientificError("invalid");
    return this.advance();
  }

  private nested<T>(callback: () => T): T {
    this.depth += 1;
    if (this.depth > MAX_NESTING_DEPTH) throw new ScientificError("limits");
    try {
      return callback();
    } finally {
      this.depth -= 1;
    }
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (
      this.current().type === "operator" &&
      (this.current().value === "+" || this.current().value === "-")
    ) {
      const operator = this.advance().value;
      const right = this.parseTerm();
      value = operator === "+" ? value + right : value - right;
      finite(value);
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (
      this.current().type === "operator" &&
      (this.current().value === "*" || this.current().value === "/")
    ) {
      const operator = this.advance().value;
      const right = this.parseUnary();
      if (operator === "/" && right === 0) {
        throw new ScientificError("division-by-zero");
      }
      value = operator === "*" ? value * right : value / right;
      finite(value);
    }
    return value;
  }

  private parseUnary(): number {
    const token = this.current();
    if (
      token.type === "operator" &&
      (token.value === "+" || token.value === "-")
    ) {
      this.advance();
      const value = this.parseUnary();
      return token.value === "-" ? -value : value;
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePostfix();
    if (this.current().type === "operator" && this.current().value === "^") {
      this.advance();
      const exponent = this.parseUnary();
      return finite(Math.pow(base, exponent));
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (
      this.current().type === "operator" &&
      (this.current().value === "!" || this.current().value === "%")
    ) {
      const operator = this.advance().value;
      value = operator === "!" ? factorial(value) : value / 100;
      finite(value);
    }
    return value;
  }

  private parsePrimary(): number {
    const token = this.current();

    if (token.type === "number") {
      this.advance();
      return finite(Number(token.value));
    }

    if (token.type === "identifier") {
      this.advance();
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      return this.parseFunction(token.value);
    }

    if (token.type === "lparen") {
      this.advance();
      const value = this.nested(() => this.parseExpression());
      this.expect("rparen");
      return value;
    }

    throw new ScientificError("invalid");
  }

  private parseFunction(name: string): number {
    return this.nested(() => {
      this.expect("lparen");
      const args: number[] = [];

      if (this.current().type !== "rparen") {
        args.push(this.parseExpression());
        while (this.current().type === "comma") {
          this.advance();
          args.push(this.parseExpression());
        }
      }
      this.expect("rparen");

      return this.applyFunction(name, args);
    });
  }

  private applyFunction(name: string, args: readonly number[]): number {
    const unary = (): number => {
      if (args.length !== 1) throw new ScientificError("invalid");
      return args[0] ?? 0;
    };
    const radians = (): number => toRadians(unary(), this.angleMode);

    if (name === "sin") return finite(snapTrig(Math.sin(radians())));
    if (name === "cos") return finite(snapTrig(Math.cos(radians())));
    if (name === "tan") {
      const angle = radians();
      if (Math.abs(Math.cos(angle)) < 1e-12) {
        throw new ScientificError("domain");
      }
      return finite(snapTrig(Math.tan(angle)));
    }
    if (name === "asin" || name === "acos") {
      const value = unary();
      if (value < -1 || value > 1) throw new ScientificError("domain");
      return finite(
        fromRadians(
          name === "asin" ? Math.asin(value) : Math.acos(value),
          this.angleMode,
        ),
      );
    }
    if (name === "atan") {
      return finite(fromRadians(Math.atan(unary()), this.angleMode));
    }
    if (name === "sinh") return finite(Math.sinh(unary()));
    if (name === "cosh") return finite(Math.cosh(unary()));
    if (name === "tanh") return finite(Math.tanh(unary()));
    if (name === "asinh") return finite(Math.asinh(unary()));
    if (name === "acosh") {
      const value = unary();
      if (value < 1) throw new ScientificError("domain");
      return finite(Math.acosh(value));
    }
    if (name === "atanh") {
      const value = unary();
      if (value <= -1 || value >= 1) throw new ScientificError("domain");
      return finite(Math.atanh(value));
    }
    if (name === "ln" || name === "log" || name === "log10") {
      const value = unary();
      if (value <= 0) throw new ScientificError("domain");
      return finite(name === "ln" ? Math.log(value) : Math.log10(value));
    }
    if (name === "exp") return finite(Math.exp(unary()));
    if (name === "sqrt") {
      const value = unary();
      if (value < 0) throw new ScientificError("domain");
      return finite(Math.sqrt(value));
    }
    if (name === "cbrt") return finite(Math.cbrt(unary()));
    if (name === "abs") return finite(Math.abs(unary()));
    if (name === "root") {
      if (args.length !== 2) throw new ScientificError("invalid");
      return root(args[0] ?? 0, args[1] ?? 0);
    }

    throw new ScientificError("invalid");
  }
}

export function evaluateScientific(
  expression: string,
  angleMode: AngleMode = "degrees",
): ScientificEvaluation {
  if (expression.trim() === "") return { ok: false, issue: "empty" };

  const normalized = normalizeExpression(expression);
  if (normalized.length > MAX_EXPRESSION_LENGTH) {
    return { ok: false, issue: "limits" };
  }

  try {
    const tokens = tokenize(normalized);
    const value = new Parser(tokens, angleMode).parse();
    return { ok: true, value };
  } catch (error) {
    if (error instanceof ScientificError) {
      return { ok: false, issue: error.issue };
    }
    if (error instanceof RangeError) {
      return { ok: false, issue: "limits" };
    }
    return { ok: false, issue: "invalid" };
  }
}

/**
 * Localized display formatting. Internal calculations stay at full double
 * precision; only this presentation layer rounds to avoid binary artifacts.
 */
export function formatScientificValue(
  value: number,
  intlLocale = "en-US",
): string {
  if (!Number.isFinite(value)) return "";
  const normalized = Object.is(value, -0) ? 0 : value;
  const magnitude = Math.abs(normalized);
  const notation =
    magnitude !== 0 && (magnitude >= 1e12 || magnitude < 1e-9)
      ? "scientific"
      : "standard";

  return new Intl.NumberFormat(intlLocale, {
    notation,
    maximumSignificantDigits: 12,
  }).format(normalized);
}

/**
 * Canonical value used by history reuse and expression insertion. Fifteen
 * significant digits remove common binary artifacts without changing the
 * engine's full-precision internal calculations.
 */
export function serializeScientificValue(value: number): string {
  const normalized = Object.is(value, -0) ? 0 : value;
  const rounded = Number.parseFloat(normalized.toPrecision(15));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}
