/**
 * Motor matemático para la solución de ecuaciones no lineales y polinomios:
 *
 *  - Iterativo secuencial (punto fijo / sustitución sucesiva).
 *  - Newton-Raphson, con derivada analítica o numérica.
 *  - Método de Bairstow, que extrae factores cuadráticos y entrega todas las
 *    raíces del polinomio, reales y complejas.
 *
 * Todas las funciones son puras: no mutan sus argumentos ni dependen de
 * estado externo. Los cálculos internos conservan la precisión completa de
 * punto flotante; el redondeo a 6 decimales corresponde a la presentación.
 */

import { compileExpression, numericDerivative } from './mathEvaluator.js';

/** Magnitud a partir de la cual se considera que la sucesión divergió. */
const DIVERGENCE_LIMIT = 1e12;

/** Umbral por debajo del cual la derivada se considera nula (tangente horizontal). */
const ZERO_DERIVATIVE = 1e-12;

/** Umbral por debajo del cual el determinante del sistema 2×2 es singular. */
const SINGULAR_DETERMINANT = 1e-14;

/** Paso de la derivada numérica por diferencias finitas centrales. */
const DERIVATIVE_STEP = 1e-6;

/**
 * Error relativo porcentual entre dos aproximaciones consecutivas:
 *
 *      εa = | (actual − anterior) / actual | × 100
 *
 * Cuando `current` es cero el cociente no está definido; en ese caso se
 * reporta el error absoluto escalado a porcentaje.
 *
 * @param {number} current aproximación actual
 * @param {number} previous aproximación anterior
 * @returns {number} error relativo porcentual (≥ 0)
 */
export function percentError(current, previous) {
  const delta = Math.abs(current - previous);
  if (delta === 0) return 0;
  if (current === 0) return delta * 100;
  return Math.abs(delta / current) * 100;
}

/**
 * Valida la tolerancia y el máximo de iteraciones comunes a los tres métodos.
 * @param {number} tol
 * @param {number} maxIter
 */
function validateStopCriteria(tol, maxIter) {
  if (!Number.isFinite(tol) || tol < 0) {
    throw new Error('La tolerancia debe ser un número mayor o igual a cero.');
  }
  if (!Number.isInteger(maxIter) || maxIter < 1 || maxIter > 500) {
    throw new Error('El máximo de iteraciones debe ser un número entero entre 1 y 500.');
  }
}

/* ------------------------------------------------------------------------- */
/* 1. Iterativo secuencial (punto fijo)                                      */
/* ------------------------------------------------------------------------- */

/**
 * Método iterativo secuencial o de punto fijo.
 *
 * La ecuación f(x) = 0 se reescribe como x = g(x) y se itera:
 *
 *      x_{k+1} = g(x_k)
 *
 * La convergencia está garantizada en un entorno del punto fijo cuando
 * |g'(x)| < 1; si la pendiente supera la unidad la sucesión se aleja de la
 * raíz y el método se detiene al superar el límite de divergencia.
 *
 * @param {{ gExpr: string, x0: number, tol: number, maxIter: number }} options
 * @returns {{
 *   history: Array<{k:number, xk:number, gxk:number, delta:number, error:number|null, isConverged:boolean}>,
 *   converged: boolean,
 *   root: number,
 *   check: number,
 *   iterations: number,
 *   status: 'converged'|'max-iterations'|'diverged',
 *   message: string
 * }}
 * @throws {Error} si la expresión de g(x) o los parámetros de corte son inválidos
 */
export function solveFixedPoint({ gExpr, x0, tol = 0.001, maxIter = 50 }) {
  validateStopCriteria(tol, maxIter);

  if (!Number.isFinite(x0)) {
    throw new Error('El valor inicial x₀ debe ser un número real válido.');
  }

  const g = compileExpression(gExpr, 'g(x)');

  const history = [];
  let xk = x0;
  let converged = false;
  let diverged = false;
  let root = x0;

  for (let k = 0; k < maxIter; k += 1) {
    const gxk = g(xk);
    const delta = gxk - xk;
    const error = percentError(gxk, xk);

    diverged = !Number.isFinite(gxk) || Math.abs(gxk) > DIVERGENCE_LIMIT;
    converged = !diverged && error <= tol;

    history.push({ k, xk, gxk, delta, error, isConverged: converged });

    root = gxk;
    xk = gxk;

    if (converged || diverged) break;
  }

  const iterations = history.length;
  let status = 'max-iterations';
  if (converged) status = 'converged';
  else if (diverged) status = 'diverged';

  let message;
  if (converged) {
    message =
      `La sucesión convergió en ${iterations} ${iterations === 1 ? 'iteración' : 'iteraciones'}: el error relativo ` +
      `porcentual cayó a ${history[history.length - 1].error.toExponential(3)} %, por debajo de la tolerancia de ${tol} %.`;
  } else if (diverged) {
    message =
      'La sucesión divergió: los valores crecieron sin control. Reescriba la ecuación en otra forma x = g(x) ' +
      'con |g′(x)| < 1 cerca de la raíz, o pruebe otro valor inicial.';
  } else {
    message =
      `Se alcanzó el límite de ${maxIter} iteraciones sin cumplir la tolerancia de ${tol} %. ` +
      'La convergencia del punto fijo puede ser muy lenta: aumente el máximo de iteraciones o replantee g(x).';
  }

  // Comprobación independiente del criterio de parada: en un punto fijo g(x*) = x*.
  let check = Number.NaN;
  try {
    check = g(root);
  } catch {
    check = Number.NaN;
  }

  return { history, converged, root, check, iterations, status, message };
}

/* ------------------------------------------------------------------------- */
/* 2. Newton-Raphson                                                         */
/* ------------------------------------------------------------------------- */

/**
 * Método de Newton-Raphson (tangentes sucesivas).
 *
 *      x_{k+1} = x_k − f(x_k) / f′(x_k)
 *
 * Si `useAutoDerivative` es verdadero o `dfExpr` está vacío, la derivada se
 * aproxima por diferencias finitas centrales con paso h = 10⁻⁶:
 *
 *      f′(x) ≈ ( f(x + h) − f(x − h) ) / (2h)
 *
 * @param {{ fExpr: string, dfExpr?: string, useAutoDerivative?: boolean, x0: number, tol: number, maxIter: number }} options
 * @returns {{
 *   history: Array<{k:number, xk:number, fxk:number, dfxk:number, xnext:number, error:number|null, isConverged:boolean}>,
 *   converged: boolean,
 *   root: number,
 *   residual: number,
 *   iterations: number,
 *   derivativeMode: 'analítica'|'numérica',
 *   status: 'converged'|'max-iterations'|'diverged'|'zero-derivative',
 *   message: string
 * }}
 * @throws {Error} si las expresiones o los parámetros de corte son inválidos
 */
export function solveNewtonRaphson({ fExpr, dfExpr = '', useAutoDerivative = true, x0, tol = 0.001, maxIter = 50 }) {
  validateStopCriteria(tol, maxIter);

  if (!Number.isFinite(x0)) {
    throw new Error('El valor inicial x₀ debe ser un número real válido.');
  }

  const f = compileExpression(fExpr, 'f(x)');
  const useNumeric = useAutoDerivative || String(dfExpr ?? '').trim() === '';
  const analytic = useNumeric ? null : compileExpression(dfExpr, "f'(x)");
  const derivative = useNumeric ? (x) => numericDerivative(f, x, DERIVATIVE_STEP) : analytic;
  const derivativeMode = useNumeric ? 'numérica' : 'analítica';

  const history = [];
  let xk = x0;
  let root = x0;
  let converged = false;
  let diverged = false;
  let zeroDerivative = false;

  for (let k = 0; k < maxIter; k += 1) {
    const fxk = f(xk);
    const dfxk = derivative(xk);

    // Tangente horizontal: la recta tangente nunca corta el eje x.
    if (!Number.isFinite(dfxk) || Math.abs(dfxk) < ZERO_DERIVATIVE) {
      history.push({ k, xk, fxk, dfxk, xnext: Number.NaN, error: null, isConverged: false });
      zeroDerivative = true;
      root = xk;
      break;
    }

    const xnext = xk - fxk / dfxk;
    const error = percentError(xnext, xk);

    diverged = !Number.isFinite(xnext) || Math.abs(xnext) > DIVERGENCE_LIMIT;
    converged = !diverged && error <= tol;

    history.push({ k, xk, fxk, dfxk, xnext, error, isConverged: converged });

    root = xnext;
    xk = xnext;

    if (converged || diverged) break;
  }

  const iterations = history.length;
  let status = 'max-iterations';
  if (zeroDerivative) status = 'zero-derivative';
  else if (converged) status = 'converged';
  else if (diverged) status = 'diverged';

  let message;
  if (converged) {
    message =
      `Newton-Raphson convergió en ${iterations} ${iterations === 1 ? 'iteración' : 'iteraciones'} usando derivada ` +
      `${derivativeMode}: el error relativo porcentual bajó a ${history[history.length - 1].error.toExponential(3)} %.`;
  } else if (zeroDerivative) {
    message =
      'Derivada prácticamente nula: tangente horizontal, la fórmula exigiría una división por cero. ' +
      'Elija un valor inicial x₀ más alejado del punto crítico de f.';
  } else if (diverged) {
    message =
      'El método divergió: las tangentes alejaron la aproximación de la raíz. Pruebe un valor inicial más ' +
      'cercano a la raíz o verifique la expresión de f(x).';
  } else {
    message =
      `Se alcanzó el límite de ${maxIter} iteraciones sin cumplir la tolerancia de ${tol} %. ` +
      'Aumente el máximo de iteraciones o acerque el valor inicial a la raíz.';
  }

  // Residual: en la raíz exacta f(x*) = 0, así que f(x*) mide la calidad obtenida.
  let residualValue = Number.NaN;
  try {
    residualValue = f(root);
  } catch {
    residualValue = Number.NaN;
  }

  return {
    history,
    converged,
    root,
    residual: residualValue,
    iterations,
    derivativeMode,
    status,
    message,
  };
}

/* ------------------------------------------------------------------------- */
/* 3. Método de Bairstow                                                     */
/* ------------------------------------------------------------------------- */

/**
 * Doble división sintética del polinomio por el factor cuadrático x² − rx − s.
 *
 * Trabaja con el arreglo `a` en orden ascendente (a[i] acompaña a xⁱ):
 *
 *      b_n = a_n ,  b_{n−1} = a_{n−1} + r·b_n ,  b_i = a_i + r·b_{i+1} + s·b_{i+2}
 *      c_n = b_n ,  c_{n−1} = b_{n−1} + r·c_n ,  c_i = b_i + r·c_{i+1} + s·c_{i+2}
 *
 * @param {number[]} a coeficientes ascendentes
 * @param {number} r
 * @param {number} s
 * @returns {{ b: number[], c: number[] }}
 */
function doubleSyntheticDivision(a, r, s) {
  const n = a.length - 1;
  const b = new Array(n + 1).fill(0);
  const c = new Array(n + 1).fill(0);

  b[n] = a[n];
  b[n - 1] = a[n - 1] + r * b[n];
  for (let i = n - 2; i >= 0; i -= 1) {
    b[i] = a[i] + r * b[i + 1] + s * b[i + 2];
  }

  c[n] = b[n];
  c[n - 1] = b[n - 1] + r * c[n];
  for (let i = n - 2; i >= 1; i -= 1) {
    c[i] = b[i] + r * c[i + 1] + s * c[i + 2];
  }

  return { b, c };
}

/**
 * Raíces del trinomio x² − r·x − s mediante la fórmula cuadrática:
 *
 *      Dq = r² + 4s ;    x = ( r ± √Dq ) / 2
 *
 * Si Dq < 0 las raíces son un par complejo conjugado r/2 ± (√|Dq|/2) i.
 *
 * @param {number} r
 * @param {number} s
 * @returns {{ discriminant: number, roots: Array<{real:number, imag:number, isComplex:boolean}> }}
 */
export function quadraticFactorRoots(r, s) {
  const raw = r * r + 4 * s;

  // Una raíz doble real produce Dq = 0 exacto solo en aritmética exacta: con
  // punto flotante queda un residuo del orden de 10⁻¹¹ que, de ser negativo,
  // disfrazaría la raíz doble como un par complejo de parte imaginaria
  // minúscula. Ese residuo se interpreta como cero.
  const scale = Math.max(1, Math.abs(r * r), Math.abs(4 * s));
  const discriminant = Math.abs(raw) < 1e-10 * scale ? 0 : raw;

  if (discriminant >= 0) {
    const sqrt = Math.sqrt(discriminant);
    return {
      discriminant,
      roots: [
        { real: (r + sqrt) / 2, imag: 0, isComplex: false },
        { real: (r - sqrt) / 2, imag: 0, isComplex: false },
      ],
    };
  }

  const imaginary = Math.sqrt(-discriminant) / 2;
  return {
    discriminant,
    roots: [
      { real: r / 2, imag: imaginary, isComplex: true },
      { real: r / 2, imag: -imaginary, isComplex: true },
    ],
  };
}

/**
 * Evalúa el polinomio en un número complejo mediante el esquema de Horner.
 * Permite comprobar cada raíz de forma independiente al criterio de parada.
 *
 * @param {number[]} descending coeficientes en orden descendente [aₙ … a₀]
 * @param {number} real parte real del punto
 * @param {number} imag parte imaginaria del punto
 * @returns {{ real: number, imag: number, magnitude: number }}
 */
export function evaluatePolynomialComplex(descending, real, imag) {
  let accReal = 0;
  let accImag = 0;

  for (const coefficient of descending) {
    const nextReal = accReal * real - accImag * imag + coefficient;
    const nextImag = accReal * imag + accImag * real;
    accReal = nextReal;
    accImag = nextImag;
  }

  return { real: accReal, imag: accImag, magnitude: Math.hypot(accReal, accImag) };
}

/**
 * Método de Bairstow para todas las raíces de un polinomio con coeficientes
 * reales, incluidos los pares complejos conjugados.
 *
 * En cada ciclo se busca un factor cuadrático x² − rx − s resolviendo el
 * sistema 2×2 que anula el resto de la doble división sintética:
 *
 *      c₂·Δr + c₃·Δs = −b₁
 *      c₁·Δr + c₂·Δs = −b₀
 *      D = c₂² − c₁·c₃
 *
 * Tras la convergencia el polinomio se deflaciona (los coeficientes del
 * cociente son b₂ … bₙ) y el proceso se repite hasta quedar en grado 2 o 1,
 * casos que se resuelven de forma directa.
 *
 * @param {{ coefficients: number[], r0?: number, s0?: number, tol?: number, maxIter?: number }} options
 *        `coefficients` en orden descendente: [aₙ, aₙ₋₁, …, a₁, a₀]
 * @returns {{
 *   factors: Array<{factorIndex:number, kind:'zero'|'quadratic'|'linear', degree:number, r:number, s:number, discriminant:number, direct:boolean, note:string, converged:boolean, iterationsHistory:Array, roots:Array}>,
 *   allRoots: Array<{index:number, real:number, imag:number, isComplex:boolean, label:string, residual:number}>,
 *   converged: boolean,
 *   degree: number,
 *   status: 'converged'|'partial',
 *   message: string
 * }}
 * @throws {Error} si el polinomio o los parámetros de corte son inválidos
 */
export function solveBairstow({ coefficients, r0 = 0, s0 = 0, tol = 0.001, maxIter = 50 }) {
  validateStopCriteria(tol, maxIter);

  if (!Array.isArray(coefficients) || coefficients.length < 3) {
    throw new Error('El polinomio debe tener al menos grado 2 (tres coeficientes).');
  }
  if (coefficients.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Todos los coeficientes deben ser números reales válidos.');
  }
  if (!Number.isFinite(r0) || !Number.isFinite(s0)) {
    throw new Error('Los valores iniciales r₀ y s₀ deben ser números reales válidos.');
  }

  // Se descartan los ceros iniciales: no aportan grado al polinomio.
  const trimmed = [...coefficients];
  while (trimmed.length > 1 && trimmed[0] === 0) trimmed.shift();

  if (trimmed.length < 2) {
    throw new Error('El coeficiente principal no puede ser cero: el polinomio quedaría sin grado.');
  }

  const original = trimmed;
  const degree = original.length - 1;

  const factors = [];
  const roots = [];
  let allConverged = true;
  const warnings = [];

  /** Registra un par de raíces y, si procede, el factor que las produjo. */
  const pushRoots = (list) => {
    for (const root of list) roots.push(root);
  };

  // Orden ascendente para seguir la notación clásica del algoritmo.
  let a = [...original].reverse();

  // Las raíces nulas se extraen antes de iterar: con a₀ = 0 el sistema 2×2
  // de Bairstow es singular desde la primera iteración.
  let zeroRoots = 0;
  while (a.length > 1 && a[0] === 0) {
    a.shift();
    zeroRoots += 1;
    pushRoots([{ real: 0, imag: 0, isComplex: false }]);
  }
  if (zeroRoots > 0) {
    factors.push({
      factorIndex: factors.length + 1,
      kind: 'zero',
      degree: zeroRoots,
      r: 0,
      s: 0,
      discriminant: 0,
      direct: true,
      note:
        `El término independiente es cero, así que x${zeroRoots > 1 ? ` elevado a ${zeroRoots}` : ''} ` +
        `se factorizó directamente: ${zeroRoots > 1 ? `hay ${zeroRoots} raíces nulas` : 'hay una raíz nula'}.`,
      converged: true,
      iterationsHistory: [],
      roots: roots.slice(0, zeroRoots),
    });
  }

  let r = r0;
  let s = s0;

  while (a.length - 1 > 2) {
    const iterationsHistory = [];
    let factorConverged = false;
    let factorNote = '';
    let singularTries = 0;

    for (let k = 1; k <= maxIter; k += 1) {
      const { b, c } = doubleSyntheticDivision(a, r, s);
      const determinant = c[2] * c[2] - c[1] * c[3];

      // Determinante singular: el sistema 2×2 no tiene solución única. Se
      // perturban r y s para salir del punto plano, como sugiere Chapra.
      if (Math.abs(determinant) < SINGULAR_DETERMINANT) {
        singularTries += 1;
        iterationsHistory.push({
          k,
          r,
          s,
          dr: Number.NaN,
          ds: Number.NaN,
          errorR: null,
          errorS: null,
          b0: b[0],
          b1: b[1],
          determinant,
          isConverged: false,
          singular: true,
        });

        if (singularTries > 3) {
          factorNote =
            'El determinante D = c₂² − c₁·c₃ se mantuvo prácticamente nulo: el sistema 2×2 es singular. ' +
            'Pruebe otros valores iniciales r₀ y s₀.';
          break;
        }

        r += 1;
        s += 1;
        continue;
      }

      const dr = (-b[1] * c[2] + b[0] * c[3]) / determinant;
      const ds = (-b[0] * c[2] + b[1] * c[1]) / determinant;

      r += dr;
      s += ds;

      const errorR = percentError(r, r - dr);
      const errorS = percentError(s, s - ds);
      const diverged = !Number.isFinite(r) || !Number.isFinite(s) || Math.abs(r) > DIVERGENCE_LIMIT || Math.abs(s) > DIVERGENCE_LIMIT;
      factorConverged = !diverged && errorR <= tol && errorS <= tol;

      iterationsHistory.push({
        k,
        r,
        s,
        dr,
        ds,
        errorR,
        errorS,
        b0: b[0],
        b1: b[1],
        determinant,
        isConverged: factorConverged,
        singular: false,
      });

      if (factorConverged) break;

      if (diverged) {
        factorNote =
          'Los valores de r y s crecieron sin control: el factor cuadrático no converge desde estos ' +
          'valores iniciales. Pruebe otros r₀ y s₀.';
        break;
      }
    }

    if (!factorConverged && factorNote === '') {
      factorNote =
        `Se alcanzó el límite de ${maxIter} iteraciones sin que εr y εs bajaran de ${tol} %. ` +
        'Las raíces mostradas son la mejor aproximación obtenida.';
    }

    if (!factorConverged) {
      allConverged = false;
      warnings.push(`Factor ${factors.length + 1}: ${factorNote}`);
    }

    const { discriminant, roots: factorRoots } = quadraticFactorRoots(r, s);

    factors.push({
      factorIndex: factors.length + 1,
      kind: 'quadratic',
      degree: 2,
      r,
      s,
      discriminant,
      direct: false,
      note: factorNote,
      converged: factorConverged,
      iterationsHistory,
      roots: factorRoots,
    });
    pushRoots(factorRoots);

    // Deflación: el cociente de la división es b₂ … bₙ.
    const { b } = doubleSyntheticDivision(a, r, s);
    a = b.slice(2);

    // Los valores de r y s convergidos son un buen punto de partida para el
    // siguiente factor, pero si quedaron en cero se reinician al valor dado.
    if (!Number.isFinite(r) || !Number.isFinite(s)) {
      r = r0;
      s = s0;
    }
  }

  // Resto del polinomio: grado 2 o grado 1, resueltos de forma exacta.
  const remainingDegree = a.length - 1;

  if (remainingDegree === 2) {
    // a₂x² + a₁x + a₀ = 0  ⟺  x² − rx − s = 0  con  r = −a₁/a₂,  s = −a₀/a₂.
    const rFinal = -a[1] / a[2];
    const sFinal = -a[0] / a[2];
    const { discriminant, roots: factorRoots } = quadraticFactorRoots(rFinal, sFinal);

    factors.push({
      factorIndex: factors.length + 1,
      kind: 'quadratic',
      degree: 2,
      r: rFinal,
      s: sFinal,
      discriminant,
      direct: true,
      note: 'Factor final de grado 2: se resolvió con la fórmula cuadrática, sin iterar.',
      converged: true,
      iterationsHistory: [],
      roots: factorRoots,
    });
    pushRoots(factorRoots);
  } else if (remainingDegree === 1) {
    // a₁x + a₀ = 0  ⟹  x = −a₀/a₁.
    const root = { real: -a[0] / a[1], imag: 0, isComplex: false };

    factors.push({
      factorIndex: factors.length + 1,
      kind: 'linear',
      degree: 1,
      r: root.real,
      s: 0,
      discriminant: 0,
      direct: true,
      note: 'Factor final lineal: la raíz se obtuvo despejando directamente.',
      converged: true,
      iterationsHistory: [],
      roots: [root],
    });
    pushRoots([root]);
  }

  const allRoots = roots.map((root, index) => ({
    index: index + 1,
    real: root.real,
    imag: root.imag,
    isComplex: root.isComplex,
    label: formatComplex(root.real, root.imag),
    residual: evaluatePolynomialComplex(original, root.real, root.imag).magnitude,
  }));

  const message = allConverged
    ? `Se extrajeron ${factors.length} ${factors.length === 1 ? 'factor' : 'factores'} y las ${allRoots.length} ` +
      `raíces del polinomio de grado ${degree}. Todos los factores cumplieron la tolerancia de ${tol} %.`
    : `Se obtuvieron ${allRoots.length} raíces, pero no todos los factores convergieron. ${warnings.join(' ')}`;

  return {
    factors,
    allRoots,
    converged: allConverged,
    degree,
    status: allConverged ? 'converged' : 'partial',
    message,
  };
}

/* ------------------------------------------------------------------------- */
/* Utilidades de presentación                                                */
/* ------------------------------------------------------------------------- */

/**
 * Formatea un número complejo como texto legible: «2.000000», «1.500000 + 0.866025 i»
 * o «1.500000 − 0.866025 i».
 *
 * @param {number} real
 * @param {number} imag
 * @param {number} [decimals=6]
 * @returns {string}
 */
export function formatComplex(real, imag, decimals = 6) {
  if (!Number.isFinite(real) || !Number.isFinite(imag)) return '∞';
  if (imag === 0) return real.toFixed(decimals);

  const sign = imag > 0 ? '+' : '−';
  return `${real.toFixed(decimals)} ${sign} ${Math.abs(imag).toFixed(decimals)} i`;
}

/**
 * Construye la representación legible de un polinomio a partir de sus
 * coeficientes en orden descendente, omitiendo los términos nulos.
 *
 * Ejemplo: [1, -3.5, 2.75, 2.125, -3.875] → «x⁴ − 3.5x³ + 2.75x² + 2.125x − 3.875».
 *
 * @param {number[]} coefficients coeficientes descendentes [aₙ … a₀]
 * @returns {string} polinomio formateado, o '0' si todos los coeficientes son nulos
 */
export function formatPolynomial(coefficients) {
  const SUPERSCRIPTS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
  const superscript = (power) =>
    String(power)
      .split('')
      .map((digit) => SUPERSCRIPTS[Number(digit)])
      .join('');

  const degree = coefficients.length - 1;
  let text = '';

  coefficients.forEach((coefficient, index) => {
    if (!Number.isFinite(coefficient) || coefficient === 0) return;

    const power = degree - index;
    const magnitude = Math.abs(coefficient);
    const sign = coefficient < 0 ? '−' : '+';

    if (text === '') {
      text += coefficient < 0 ? '−' : '';
    } else {
      text += ` ${sign} `;
    }

    // El coeficiente 1 se omite salvo en el término independiente.
    if (magnitude !== 1 || power === 0) text += String(magnitude);

    if (power === 1) text += 'x';
    else if (power > 1) text += `x${superscript(power)}`;
  });

  return text === '' ? '0' : text;
}
