/**
 * Evaluador matemático seguro para expresiones de una variable.
 *
 * Implementa un analizador léxico y un parser de descenso recursivo que
 * construye un árbol de funciones evaluables. No se usa `eval` ni
 * `new Function`, por lo que ninguna cadena del usuario llega al intérprete
 * de JavaScript.
 *
 * Gramática soportada (de menor a mayor precedencia):
 *
 *   expression := term (('+' | '-') term)*
 *   term       := unary (('*' | '/') unary | unary)*      // producto implícito
 *   unary      := ('+' | '-') unary | power
 *   power      := primary ('^' unary)?                    // asociativo a derecha
 *   primary    := número | constante | variable | función '(' expression ')' | '(' expression ')'
 */

/** Funciones de una sola entrada reconocidas por el parser. */
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

/** Constantes reconocidas por el parser (la comparación es sin distinguir mayúsculas). */
const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

/** Nombre de la variable independiente aceptada en las expresiones. */
const VARIABLE = 'x';

/** Texto de ayuda con la sintaxis admitida, reutilizable en la interfaz. */
export const SYNTAX_HELP =
  'Operadores: + − * / ^ · Funciones: sin, cos, tan, exp, ln, log, sqrt, abs · Constantes: pi, e · ' +
  'Producto implícito permitido: 2x, 3(x+1), x(x−1).';

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
const isDigit = (char) => DIGITS.includes(char);
const isLetter = (char) => /[A-Za-z]/.test(char);

/**
 * Divide la expresión en tokens.
 *
 * @param {string} source expresión original
 * @returns {Array<{type:'number'|'name'|'op'|'lparen'|'rparen', value:string|number, at:number}>}
 */
function tokenize(source) {
  const tokens = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    // Espacios y separadores invisibles (incluye el espacio fino de los PDF).
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    // Números: admiten punto o coma decimal y notación científica (1e-6).
    if (isDigit(char) || char === '.' || char === ',') {
      let raw = '';
      let hasSeparator = false;

      while (index < source.length) {
        const digit = source[index];
        if (isDigit(digit)) {
          raw += digit;
          index += 1;
        } else if ((digit === '.' || digit === ',') && !hasSeparator) {
          hasSeparator = true;
          raw += '.';
          index += 1;
        } else {
          break;
        }
      }

      // El exponente solo se consume si realmente va seguido de dígitos,
      // para no confundir «2e-x» (producto por la constante e) con «2e-5».
      const exponent = source.slice(index);
      const match = /^[eE][+-]?\d+/.exec(exponent);
      if (match) {
        raw += match[0];
        index += match[0].length;
      }

      const value = Number(raw);
      if (!Number.isFinite(value)) {
        throw new Error(`«${raw}» no es un número válido.`);
      }
      tokens.push({ type: 'number', value, at: index });
      continue;
    }

    // Identificadores: variable, constantes y nombres de función.
    if (isLetter(char)) {
      let raw = '';
      while (index < source.length && (isLetter(source[index]) || isDigit(source[index]))) {
        raw += source[index];
        index += 1;
      }
      tokens.push({ type: 'name', value: raw, at: index });
      continue;
    }

    if (char === '(' || char === '[' || char === '{') {
      tokens.push({ type: 'lparen', value: '(', at: index });
      index += 1;
      continue;
    }

    if (char === ')' || char === ']' || char === '}') {
      tokens.push({ type: 'rparen', value: ')', at: index });
      index += 1;
      continue;
    }

    // El doble asterisco de JavaScript se acepta como potencia.
    if (char === '*' && source[index + 1] === '*') {
      tokens.push({ type: 'op', value: '^', at: index });
      index += 2;
      continue;
    }

    if (OPERATORS[char]) {
      tokens.push({ type: 'op', value: OPERATORS[char], at: index });
      index += 1;
      continue;
    }

    throw new Error(`Carácter no permitido: «${char}» en la posición ${index + 1}.`);
  }

  return tokens;
}

/**
 * Construye el árbol evaluable a partir de los tokens.
 *
 * Cada nodo es una función `(x) => number`, de modo que evaluar la expresión
 * para distintos valores de x no vuelve a analizar el texto.
 *
 * @param {Array} tokens salida de `tokenize`
 * @returns {(x:number) => number}
 */
function parse(tokens) {
  let position = 0;

  const peek = () => tokens[position];
  const next = () => tokens[position++];

  /** true si el token actual puede iniciar un factor (producto implícito). */
  const startsFactor = () => {
    const token = peek();
    if (!token) return false;
    return token.type === 'number' || token.type === 'name' || token.type === 'lparen';
  };

  const parsePrimary = () => {
    const token = next();

    if (!token) {
      throw new Error('La expresión termina de forma inesperada: falta un operando.');
    }

    if (token.type === 'number') {
      const { value } = token;
      return () => value;
    }

    if (token.type === 'lparen') {
      const inner = parseExpression();
      const closing = next();
      if (!closing || closing.type !== 'rparen') {
        throw new Error('Falta un paréntesis de cierre «)».');
      }
      return inner;
    }

    if (token.type === 'name') {
      const name = String(token.value);
      const lower = name.toLowerCase();

      if (lower === VARIABLE) {
        return (x) => x;
      }

      if (Object.hasOwn(FUNCTIONS, lower)) {
        const fn = FUNCTIONS[lower];
        const opening = next();
        if (!opening || opening.type !== 'lparen') {
          throw new Error(`La función «${name}» requiere paréntesis, por ejemplo ${lower}(x).`);
        }
        const argument = parseExpression();
        const closing = next();
        if (!closing || closing.type !== 'rparen') {
          throw new Error(`Falta el paréntesis de cierre de «${name}».`);
        }
        return (x) => fn(argument(x));
      }

      if (Object.hasOwn(CONSTANTS, lower)) {
        const value = CONSTANTS[lower];
        return () => value;
      }

      throw new Error(`Nombre desconocido: «${name}». Use x, pi, e o las funciones sin, cos, tan, exp, ln, sqrt, abs.`);
    }

    throw new Error(`Se esperaba un número o una variable, pero se encontró «${token.value}».`);
  };

  /** Potencia: asociativa a la derecha, con exponente unario (2^-1). */
  const parsePower = () => {
    const base = parsePrimary();
    const token = peek();

    if (token && token.type === 'op' && token.value === '^') {
      next();
      const exponent = parseUnary();
      return (x) => {
        const result = base(x) ** exponent(x);
        if (Number.isNaN(result)) {
          throw new Error('Potencia indefinida: base negativa con exponente fraccionario.');
        }
        return result;
      };
    }

    return base;
  };

  const parseUnary = () => {
    const token = peek();

    if (token && token.type === 'op' && (token.value === '-' || token.value === '+')) {
      next();
      const operand = parseUnary();
      return token.value === '-' ? (x) => -operand(x) : operand;
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
        const previous = left;

        left =
          token.value === '*'
            ? (x) => previous(x) * right(x)
            : (x) => {
                const divisor = right(x);
                if (divisor === 0) {
                  throw new Error('División entre cero durante la evaluación de la expresión.');
                }
                return previous(x) / divisor;
              };
        continue;
      }

      // Producto implícito: 2x, 3(x+1), x(x−1), 2 sin(x).
      if (startsFactor()) {
        const right = parseUnary();
        const previous = left;
        left = (x) => previous(x) * right(x);
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
      const previous = left;
      left = token.value === '+' ? (x) => previous(x) + right(x) : (x) => previous(x) - right(x);
    }
  }

  const tree = parseExpression();

  if (position < tokens.length) {
    const token = tokens[position];
    throw new Error(`Sobra «${token.value}» al final de la expresión. Revise los operadores y paréntesis.`);
  }

  return tree;
}

/**
 * Compila una expresión en una función evaluable `f(x)`.
 *
 * El análisis se hace una sola vez: la función devuelta puede llamarse miles
 * de veces sin volver a recorrer el texto. Cualquier evaluación que produzca
 * un valor no finito lanza un error descriptivo.
 *
 * @param {string} expression texto de la expresión, por ejemplo 'x^3 - 2x - 5'
 * @param {string} [label='f(x)'] nombre usado en los mensajes de error
 * @returns {(x:number) => number} función evaluable
 * @throws {Error} si la expresión está vacía o su sintaxis es inválida
 */
export function compileExpression(expression, label = 'f(x)') {
  const source = String(expression ?? '').trim();

  if (source === '') {
    throw new Error(`La expresión de ${label} está vacía.`);
  }

  let tree;
  try {
    tree = parse(tokenize(source));
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
 * Útil para validar un campo mientras el usuario escribe.
 *
 * @param {string} expression
 * @returns {{ valid: boolean, message: string }}
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
 * Derivada numérica por diferencias finitas centrales:
 *
 *      f'(x) ≈ ( f(x + h) − f(x − h) ) / (2h)
 *
 * @param {(x:number) => number} f función ya compilada
 * @param {number} x punto de evaluación
 * @param {number} [h=1e-6] paso de la diferencia
 * @returns {number}
 */
export function numericDerivative(f, x, h = 1e-6) {
  return (f(x + h) - f(x - h)) / (2 * h);
}
