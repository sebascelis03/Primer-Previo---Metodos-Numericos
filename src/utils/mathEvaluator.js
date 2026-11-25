/**
 * Evaluador matemático seguro para expresiones de una variable.
 *
 * Implementa un analizador léxico y un parser de descenso recursivo que
 * construye un árbol sintáctico (AST) con posiciones de carácter (start, end, caret).
 * Ese mismo árbol se usa para dos fines:
 *
 *  1. Compilarlo a una función evaluable `f(x)` (motor numérico).
 *  2. Dibujarlo con notación matemática 2D interactiva estilo Photomath.
 *
 * No se usa `eval` ni `new Function`, por lo que ninguna cadena del usuario
 * llega al intérprete de JavaScript.
 */

/**
 * Raíz n-ésima real. Admite radicandos negativos cuando el índice es un
 * entero impar, como en ∛(−8) = −2.
 * @param {number} value radicando
 * @param {number} index índice de la raíz
 * @returns {number}
 */
function nthRoot(value, index) {
  if (!Number.isFinite(index) || index === 0) {
    throw new Error(`Índice de raíz inválido: nroot(${value}, ${index}).`);
  }
  if (value < 0) {
    if (Number.isInteger(index) && Math.abs(index) % 2 === 1) {
      return -((-value) ** (1 / index));
    }
    throw new Error(`Raíz de índice par de un número negativo: nroot(${value}, ${index}).`);
  }
  return value ** (1 / index);
}

/** Funciones reconocidas por el parser. */
const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  abs: Math.abs,
  sqrt: (value) => {
    if (value < 0) {
      throw new Error(`Raíz cuadrada de un número negativo: sqrt(${value}).`);
    }
    return Math.sqrt(value);
  },
  cbrt: Math.cbrt,
  nroot: nthRoot,
  root: nthRoot,
  ln: (value) => {
    if (value <= 0) {
      throw new Error(`Logaritmo natural de un número no positivo: ln(${value}).`);
    }
    return Math.log(value);
  },
  log: (value) => {
    if (value <= 0) {
      throw new Error(`Logaritmo de un número no positivo: log(${value}).`);
    }
    return Math.log(value);
  },
  log10: (value) => {
    if (value <= 0) {
      throw new Error(`Logaritmo de un número no positivo: log10(${value}).`);
    }
    return Math.log10(value);
  },
};

/** Número de argumentos de las funciones que no son de una sola entrada. */
const ARITY = {
  nroot: 2,
  root: 2,
};

/** Constantes reconocidas por el parser (la comparación es sin distinguir mayúsculas). */
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

/** Nombre de la variable independiente aceptada en las expresiones. */
const VARIABLE = 'x';

/** Nombres de función disponibles, útiles para la edición asistida. */
export const FUNCTION_NAMES = Object.keys(FUNCTIONS);

/**
 * Identificadores conocidos, del más largo al más corto. Permite separar
 * secuencias pegadas como «pix», «2xsin(x)» o «x2» en sus partes válidas.
 */
const KNOWN_NAMES = [...Object.keys(FUNCTIONS), ...Object.keys(CONSTANTS), VARIABLE].sort(
  (a, b) => b.length - a.length
);

/** Texto de ayuda con la sintaxis admitida, reutilizable en la interfaz. */
export const SYNTAX_HELP =
  'Haz clic directamente sobre cualquier casilla □ de la ecuación o usa Tab para saltar al siguiente hueco.';

/**
 * Operadores admitidos. Incluye los signos tipográficos que suelen aparecer
 * al copiar una expresión desde un PDF o un documento de texto.
 */
const OPERATORS = {
  '+': '+',
  '-': '-',
  '−': '-',
  '–': '-',
  '*': '*',
  '·': '*',
  '×': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
};

const DIGITS = '0123456789';
const isDigit = (char) => char !== undefined && DIGITS.includes(char);
const isLetter = (char) => char !== undefined && /[A-Za-z]/.test(char);

/**
 * Separa una secuencia alfanumérica en identificadores conocidos y números.
 * @param {string} raw secuencia original, p. ej. 'pix' o 'log10x'
 * @param {number} at posición de inicio en la expresión
 */
function splitIdentifier(raw, at) {
  const tokens = [];
  let offset = 0;

  while (offset < raw.length) {
    const rest = raw.slice(offset);
    const digits = /^\d+/.exec(rest);

    if (digits) {
      tokens.push({
        type: 'number',
        value: Number(digits[0]),
        raw: digits[0],
        at: at + offset,
        end: at + offset + digits[0].length,
      });
      offset += digits[0].length;
      continue;
    }

    const lower = rest.toLowerCase();
    const name = KNOWN_NAMES.find((candidate) => lower.startsWith(candidate));

    if (!name) {
      const word = /^[A-Za-z]+/.exec(rest)?.[0] ?? rest;
      throw new Error(
        `Nombre desconocido: «${word}». Use x, pi, e o funciones como sin, cos, tan, exp, ln, log10, sqrt, cbrt, nroot, abs.`
      );
    }

    tokens.push({
      type: 'name',
      value: rest.slice(0, name.length),
      at: at + offset,
      end: at + offset + name.length,
    });
    offset += name.length;
  }

  return tokens;
}

/**
 * Divide la expresión en tokens con sus rangos `[at, end]`.
 *
 * Si la coma aparece dentro de una función multi-argumento como `nroot(8,3)`,
 * siempre se trata como separador de argumentos y no como coma decimal.
 *
 * @param {string} source expresión original
 * @returns {Array<{type:'number'|'name'|'op'|'lparen'|'rparen'|'comma', value:string|number, raw?:string, at:number, end:number}>}
 */
function tokenize(source) {
  const tokens = [];
  const callStack = [];
  let index = 0;

  const insideMultiArgCall = () =>
    callStack.length > 0 && (ARITY[callStack[callStack.length - 1]] ?? 1) > 1;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (isDigit(char) || char === '.') {
      const start = index;
      let raw = '';
      let hasSeparator = false;

      while (index < source.length) {
        const digit = source[index];
        if (isDigit(digit)) {
          raw += digit;
          index += 1;
        } else if (digit === '.' && !hasSeparator) {
          hasSeparator = true;
          raw += '.';
          index += 1;
        } else if (
          digit === ',' &&
          !hasSeparator &&
          !insideMultiArgCall() &&
          isDigit(source[index - 1]) &&
          isDigit(source[index + 1])
        ) {
          hasSeparator = true;
          raw += '.';
          index += 1;
        } else {
          break;
        }
      }

      const match = /^[eE][+-]?\d+/.exec(source.slice(index));
      if (match) {
        raw += match[0];
        index += match[0].length;
      }

      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new Error(`«${raw}» no es un número válido.`);
      }
      tokens.push({ type: 'number', value, raw, at: start, end: index });
      continue;
    }

    if (isLetter(char)) {
      const start = index;
      let raw = '';
      while (index < source.length && (isLetter(source[index]) || isDigit(source[index]))) {
        raw += source[index];
        index += 1;
      }
      tokens.push(...splitIdentifier(raw, start));
      continue;
    }

    if (char === '(' || char === '[' || char === '{') {
      const prev = tokens[tokens.length - 1];
      const fnName = prev && prev.type === 'name' ? String(prev.value).toLowerCase() : null;
      callStack.push(fnName);
      tokens.push({ type: 'lparen', value: '(', at: index, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ')' || char === ']' || char === '}') {
      if (callStack.length > 0) callStack.pop();
      tokens.push({ type: 'rparen', value: ')', at: index, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === ',' || char === ';') {
      tokens.push({ type: 'comma', value: ',', at: index, end: index + 1 });
      index += 1;
      continue;
    }

    if (char === '*' && source[index + 1] === '*') {
      tokens.push({ type: 'op', value: '^', at: index, end: index + 2 });
      index += 2;
      continue;
    }

    if (OPERATORS[char]) {
      tokens.push({ type: 'op', value: OPERATORS[char], at: index, end: index + 1 });
      index += 1;
      continue;
    }

    throw new Error(`Carácter no permitido: «${char}» en la posición ${index + 1}.`);
  }

  return tokens;
}

/**
 * Construye el árbol sintáctico a partir de los tokens, anotando cada nodo con
 * su rango de caracteres `{ start, end, caret }` en la cadena original `source`.
 */
function parse(tokens, { tolerant = false, sourceLength = 0 } = {}) {
  let position = 0;
  let incomplete = false;
  let malformed = false;

  const peek = () => tokens[position];
  const next = () => tokens[position++];
  const prevEnd = () => (position > 0 ? tokens[position - 1].end : 0);

  const slot = (atPosition = prevEnd()) => {
    incomplete = true;
    return { type: 'slot', start: atPosition, end: atPosition, caret: atPosition };
  };

  const startsFactor = () => {
    const token = peek();
    if (!token) return false;
    return token.type === 'number' || token.type === 'name' || token.type === 'lparen';
  };

  const expectClosing = (message) => {
    const closing = peek();
    if (closing && closing.type === 'rparen') {
      position += 1;
      return closing.end;
    }
    if (!tolerant) throw new Error(message);
    if (closing) malformed = true;
    else incomplete = true;
    return prevEnd();
  };

  const parseCall = (nameToken) => {
    const name = String(nameToken.value);
    const lower = name.toLowerCase();
    const arity = ARITY[lower] ?? 1;
    const usage = arity === 2 ? `${lower}(x, n)` : `${lower}(x)`;

    if (!peek() || peek().type !== 'lparen') {
      if (tolerant) {
        return {
          type: 'call',
          name: lower,
          args: Array.from({ length: arity }, () => slot(nameToken.end)),
          start: nameToken.at,
          end: nameToken.end,
          caret: nameToken.end,
        };
      }
      throw new Error(`La función «${name}» requiere paréntesis, por ejemplo ${usage}.`);
    }
    const openToken = next();

    const args = [];
    let slotAnchor = openToken.end;

    for (;;) {
      const token = peek();
      if (tolerant && (!token || token.type === 'rparen' || token.type === 'comma')) {
        const caretPos = token ? token.at : slotAnchor;
        args.push(slot(caretPos));
      } else {
        args.push(parseExpression());
      }
      if (peek() && peek().type === 'comma') {
        const commaToken = next();
        slotAnchor = commaToken.end;
        continue;
      }
      break;
    }

    if (args.length !== arity) {
      if (!tolerant) {
        throw new Error(
          arity === 2
            ? `La función «${name}» necesita dos argumentos separados por coma: ${usage}.`
            : `La función «${name}» recibe un solo argumento, por ejemplo ${usage}.`
        );
      }
      if (args.length < arity) {
        while (args.length < arity) args.push(slot(prevEnd()));
      } else {
        malformed = true;
        args.length = arity;
      }
    }

    const endPos = expectClosing(`Falta el paréntesis de cierre de «${name}».`);
    return {
      type: 'call',
      name: lower,
      args,
      start: nameToken.at,
      end: endPos,
      caret: args[0]?.caret ?? openToken.end,
    };
  };

  const parsePrimary = () => {
    const token = peek();

    if (!token) {
      if (tolerant) return slot(sourceLength || prevEnd());
      throw new Error('La expresión termina de forma inesperada: falta un operando.');
    }

    if (token.type === 'number') {
      next();
      return {
        type: 'num',
        value: token.value,
        raw: token.raw ?? String(token.value),
        start: token.at,
        end: token.end,
        caret: token.end,
      };
    }

    if (token.type === 'lparen') {
      const open = next();
      if (tolerant && peek() && peek().type === 'rparen') {
        const close = next();
        incomplete = true;
        return {
          type: 'slot',
          start: open.at,
          end: close.end,
          caret: open.end,
        };
      }
      const inner = parseExpression();
      const closeEnd = expectClosing('Falta un paréntesis de cierre «)».');
      return {
        ...inner,
        start: open.at,
        end: closeEnd,
      };
    }

    if (token.type === 'name') {
      const nameToken = next();
      const name = String(nameToken.value);
      const lower = name.toLowerCase();

      if (lower === VARIABLE) {
        return { type: 'var', start: nameToken.at, end: nameToken.end, caret: nameToken.end };
      }
      if (Object.hasOwn(FUNCTIONS, lower)) return parseCall(nameToken);
      if (Object.hasOwn(CONSTANTS, lower)) {
        return { type: 'const', name: lower, start: nameToken.at, end: nameToken.end, caret: nameToken.end };
      }

      throw new Error(`Nombre desconocido: «${name}».`);
    }

    if (tolerant) return slot(token.at);
    throw new Error(`Se esperaba un número o una variable, pero se encontró «${token.value}».`);
  };

  const parsePower = () => {
    const base = parsePrimary();
    const token = peek();

    if (token && token.type === 'op' && token.value === '^') {
      next();
      const exponent = parseUnary();
      return {
        type: 'bin',
        op: '^',
        left: base,
        right: exponent,
        start: base.start,
        end: exponent.end,
        caret: exponent.caret ?? exponent.end,
      };
    }

    return base;
  };

  const parseUnary = () => {
    const token = peek();

    if (token && token.type === 'op' && (token.value === '-' || token.value === '+')) {
      const opToken = next();
      const operand = parseUnary();
      return opToken.value === '-'
        ? { type: 'neg', arg: operand, start: opToken.at, end: operand.end, caret: operand.caret }
        : operand;
    }

    return parsePower();
  };

  const parseTerm = () => {
    let left = parseUnary();

    for (;;) {
      const token = peek();

      if (token && token.type === 'op' && (token.value === '*' || token.value === '/')) {
        next();
        const right = parseUnary();
        left = {
          type: 'bin',
          op: token.value,
          left,
          right,
          start: left.start,
          end: right.end,
          caret: right.caret,
        };
        continue;
      }

      if (startsFactor()) {
        const right = parseUnary();
        left = {
          type: 'bin',
          op: '*',
          left,
          right,
          implicit: true,
          start: left.start,
          end: right.end,
          caret: right.caret,
        };
        continue;
      }

      return left;
    }
  };

  function parseExpression() {
    let left = parseTerm();

    for (;;) {
      const token = peek();
      if (!token || token.type !== 'op' || (token.value !== '+' && token.value !== '-')) return left;

      next();
      const right = parseTerm();
      left = {
        type: 'bin',
        op: token.value,
        left,
        right,
        start: left.start,
        end: right.end,
        caret: right.caret,
      };
    }
  }

  const tree = parseExpression();

  if (position < tokens.length) {
    if (!tolerant) {
      const token = tokens[position];
      throw new Error(`Sobra «${token.value}» al final de la expresión. Revise los operadores y paréntesis.`);
    }
    malformed = true;
  }

  return { tree, incomplete, malformed };
}

/**
 * Convierte el árbol sintáctico en una función `(x) => number`.
 * @param {object} node nodo del AST
 * @returns {(x:number) => number}
 */
function compileNode(node) {
  switch (node.type) {
    case 'num': {
      const { value } = node;
      return () => value;
    }
    case 'var':
      return (x) => x;
    case 'const': {
      const value = CONSTANTS[node.name];
      return () => value;
    }
    case 'neg': {
      const operand = compileNode(node.arg);
      return (x) => -operand(x);
    }
    case 'call': {
      const fn = FUNCTIONS[node.name];
      const args = node.args.map(compileNode);
      if (args.length === 1) {
        const [argument] = args;
        return (x) => fn(argument(x));
      }
      return (x) => fn(...args.map((argument) => argument(x)));
    }
    case 'bin': {
      const left = compileNode(node.left);
      const right = compileNode(node.right);

      switch (node.op) {
        case '+':
          return (x) => left(x) + right(x);
        case '-':
          return (x) => left(x) - right(x);
        case '*':
          return (x) => left(x) * right(x);
        case '/':
          return (x) => {
            const divisor = right(x);
            if (divisor === 0) {
              throw new Error('División entre cero durante la evaluación de la expresión.');
            }
            return left(x) / divisor;
          };
        case '^':
          return (x) => {
            const result = left(x) ** right(x);
            if (Number.isNaN(result)) {
              throw new Error('Potencia indefinida: base negativa con exponente fraccionario.');
            }
            return result;
          };
        default:
          throw new Error(`Operador desconocido: «${node.op}».`);
      }
    }
    default:
      throw new Error('La expresión está incompleta: complete los espacios vacíos.');
  }
}

/**
 * Compila una expresión en una función evaluable `f(x)`.
 */
export function compileExpression(expression, label = 'f(x)') {
  const source = String(expression ?? '').trim();

  if (source === '') {
    throw new Error(`La expresión de ${label} está vacía.`);
  }

  let tree;
  try {
    tree = compileNode(parse(tokenize(source)).tree);
  } catch (error) {
    throw new Error(`Sintaxis inválida en ${label}: ${error.message}`);
  }

  return (x) => {
    if (!Number.isFinite(x)) {
      throw new Error(`No se puede evaluar ${label} en x = ${x}.`);
    }

    let value;
    try {
      value = tree(x);
    } catch (error) {
      throw new Error(`Error al evaluar ${label} en x = ${x}: ${error.message}`);
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(
        `${label} no está definida en x = ${x} (el cálculo produjo ${Number.isNaN(value) ? 'un valor indeterminado' : 'un valor infinito'}).`
      );
    }

    return value;
  };
}

/**
 * Comprueba si una expresión es sintácticamente válida, sin evaluarla.
 */
export function checkExpression(expression) {
  const source = String(expression ?? '').trim();
  if (source === '') return { valid: false, message: 'La expresión está vacía.' };

  try {
    parse(tokenize(source));
    return { valid: true, message: '' };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}

/**
 * Árbol sintáctico tolerante con rangos de posición para la vista interactiva Photomath.
 */
export function parseExpressionAST(expression) {
  const raw = String(expression ?? '');
  if (raw.trim() === '') return { ast: null, incomplete: true, malformed: false, error: '' };

  try {
    const { tree, incomplete, malformed } = parse(tokenize(raw), {
      tolerant: true,
      sourceLength: raw.length,
    });
    return { ast: tree, incomplete, malformed, error: '' };
  } catch (error) {
    return { ast: null, incomplete: false, malformed: true, error: error.message };
  }
}

/**
 * Derivada numérica por diferencias finitas centrales:
 *
 *      f'(x) ≈ ( f(x + h) − f(x − h) ) / (2h)
 */
export function numericDerivative(f, x, h = 1e-6) {
  return (f(x + h) - f(x - h)) / (2 * h);
}
