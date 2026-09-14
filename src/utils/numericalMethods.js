/**
 * Motor matemático para la resolución de sistemas de ecuaciones lineales 3x3
 * mediante los métodos iterativos de Jacobi y Gauss-Seidel.
 *
 * Todas las funciones de este módulo son puras: no mutan sus argumentos
 * ni dependen de estado externo.
 */

/** Tamaño fijo del sistema soportado por la aplicación. */
export const SIZE = 3;

/** Cifras decimales a las que se redondea el resultado final del array. */
export const DECIMALS = 6;

const FACTOR = 10 ** DECIMALS;

/**
 * Redondea a 6 cifras decimales. Los valores no finitos (Infinity, NaN)
 * se devuelven intactos para que el consumidor pueda detectar divergencia.
 * @param {number} value
 * @returns {number}
 */
export function round6(value) {
  if (!Number.isFinite(value)) return value;
  return Math.round((value + Number.EPSILON * Math.sign(value)) * FACTOR) / FACTOR;
}

/**
 * Error relativo porcentual entre la aproximación actual y la anterior.
 *
 *      e = | (x_actual - x_anterior) / x_actual | * 100
 *
 * Si x_actual es cero el cociente no está definido; en ese caso se reporta
 * el error absoluto escalado a porcentaje (criterio conservador que evita
 * devolver Infinity y detener el proceso de forma prematura).
 *
 * @param {number} current
 * @param {number} previous
 * @returns {number} error relativo porcentual (>= 0)
 */
export function relativeError(current, previous) {
  const delta = Math.abs(current - previous);
  if (delta === 0) return 0;
  if (current === 0) return delta * 100;
  return Math.abs(delta / current) * 100;
}

/**
 * Verifica si la matriz A es estrictamente diagonal dominante, es decir,
 * si para toda fila i se cumple:  |a_ii| > Σ |a_ij|  con j != i.
 *
 * La dominancia diagonal estricta es condición SUFICIENTE (no necesaria)
 * para garantizar la convergencia de Jacobi y Gauss-Seidel.
 *
 * @param {number[][]} A matriz 3x3
 * @returns {{ isDominant: boolean, hasZeroDiagonal: boolean, message: string, rows: Array<{index:number, diagonal:number, sum:number, ok:boolean}> }}
 */
export function checkDiagonalDominance(A) {
  const rows = [];
  let hasZeroDiagonal = false;

  for (let i = 0; i < SIZE; i += 1) {
    const diagonal = Math.abs(A[i][i]);
    let sum = 0;
    for (let j = 0; j < SIZE; j += 1) {
      if (j !== i) sum += Math.abs(A[i][j]);
    }
    if (diagonal === 0) hasZeroDiagonal = true;
    rows.push({
      index: i,
      diagonal: round6(diagonal),
      sum: round6(sum),
      ok: diagonal > sum,
    });
  }

  const failing = rows.filter((row) => !row.ok).map((row) => row.index + 1);
  const isDominant = failing.length === 0;

  let message;
  if (hasZeroDiagonal) {
    message =
      'La matriz tiene al menos un cero en la diagonal principal. Los métodos iterativos ' +
      'requieren dividir entre a_ii, por lo que es necesario reordenar las ecuaciones (pivoteo) antes de resolver.';
  } else if (isDominant) {
    message =
      'La matriz es estrictamente diagonal dominante: en cada fila |a_ii| es mayor que la suma de los ' +
      'valores absolutos de los demás coeficientes. Se garantiza la convergencia de Jacobi y Gauss-Seidel.';
  } else {
    const plural = failing.length > 1;
    message =
      `${plural ? 'Las filas' : 'La fila'} ${failing.join(', ')} no cumple${plural ? 'n' : ''} el criterio ` +
      '|a_ii| > Σ|a_ij|. La matriz NO es estrictamente diagonal dominante, por lo que la convergencia no está ' +
      'garantizada: el método puede converger lentamente o divergir. Se recomienda reordenar las ecuaciones.';
  }

  return { isDominant, hasZeroDiagonal, message, rows };
}

/**
 * Valida la forma y el contenido de los datos de entrada.
 * Lanza un Error con mensaje legible si algo es inconsistente.
 */
function validateInput(A, b, x0, tolerance, maxIterations) {
  if (!Array.isArray(A) || A.length !== SIZE || A.some((row) => !Array.isArray(row) || row.length !== SIZE)) {
    throw new Error('La matriz A debe ser de 3x3.');
  }
  if (!Array.isArray(b) || b.length !== SIZE) {
    throw new Error('El vector b debe tener 3 elementos.');
  }
  if (!Array.isArray(x0) || x0.length !== SIZE) {
    throw new Error('El vector inicial debe tener 3 elementos.');
  }

  const allNumbers = [...A.flat(), ...b, ...x0];
  if (allNumbers.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Todos los coeficientes deben ser números reales válidos.');
  }
  for (let i = 0; i < SIZE; i += 1) {
    if (A[i][i] === 0) {
      throw new Error(
        `El elemento a${i + 1}${i + 1} de la diagonal es cero: no es posible despejar x${i + 1}. ` +
          'Reordene las ecuaciones para evitar ceros en la diagonal principal.'
      );
    }
  }
  if (!Number.isFinite(tolerance) || tolerance < 0) {
    throw new Error('La tolerancia debe ser un número mayor o igual a cero.');
  }
  if (!Number.isInteger(maxIterations) || maxIterations < 1) {
    throw new Error('El máximo de iteraciones debe ser un entero mayor o igual a 1.');
  }
}

/**
 * Núcleo iterativo compartido por Jacobi y Gauss-Seidel.
 *
 * La única diferencia entre ambos métodos es la fuente de los valores usados
 * dentro de la sumatoria:
 *  - Jacobi        -> siempre el vector de la iteración anterior (k-1).
 *  - Gauss-Seidel  -> los valores más recientes disponibles (k para j < i).
 *
 * @param {number[][]} A
 * @param {number[]} b
 * @param {number[]} x0
 * @param {number} tolerance
 * @param {number} maxIterations
 * @param {boolean} useLatestValues  true => Gauss-Seidel, false => Jacobi
 * @returns {Array<{k:number, x1:number, x2:number, x3:number, error:number|null, isConverged:boolean}>}
 */
function iterate(A, b, x0, tolerance, maxIterations, useLatestValues) {
  validateInput(A, b, x0, tolerance, maxIterations);

  // Iteración 0: el vector inicial. Aún no existe error relativo.
  const history = [
    {
      k: 0,
      x1: round6(x0[0]),
      x2: round6(x0[1]),
      x3: round6(x0[2]),
      error: null,
      isConverged: false,
    },
  ];

  let previous = [...x0];

  for (let k = 1; k <= maxIterations; k += 1) {
    // Para Gauss-Seidel el vector de trabajo arranca como copia del anterior
    // y se va sobrescribiendo, de modo que la sumatoria usa valores frescos.
    const current = [...previous];
    const errors = new Array(SIZE).fill(0);

    for (let i = 0; i < SIZE; i += 1) {
      const source = useLatestValues ? current : previous;
      let sum = b[i];
      for (let j = 0; j < SIZE; j += 1) {
        if (j !== i) sum -= A[i][j] * source[j];
      }
      current[i] = sum / A[i][i];
      errors[i] = relativeError(current[i], previous[i]);
    }

    const diverged = current.some((value) => !Number.isFinite(value));
    const maxError = diverged ? Number.POSITIVE_INFINITY : Math.max(...errors);
    const isConverged = !diverged && maxError <= tolerance;

    history.push({
      k,
      x1: round6(current[0]),
      x2: round6(current[1]),
      x3: round6(current[2]),
      error: round6(maxError),
      isConverged,
    });

    if (isConverged || diverged) break;

    previous = current;
  }

  return history;
}

/**
 * Método de Jacobi (desplazamientos simultáneos).
 *
 * @param {number[][]} A matriz de coeficientes 3x3
 * @param {number[]} b vector de términos independientes
 * @param {number[]} [x0=[0,0,0]] vector inicial
 * @param {number} [tolerance=0.001] tolerancia sobre el error relativo porcentual máximo
 * @param {number} [maxIterations=50] máximo de iteraciones
 * @returns {Array<{k:number, x1:number, x2:number, x3:number, error:number|null, isConverged:boolean}>}
 */
export function solveJacobi(A, b, x0 = [0, 0, 0], tolerance = 0.001, maxIterations = 50) {
  return iterate(A, b, x0, tolerance, maxIterations, false);
}

/**
 * Método de Gauss-Seidel (desplazamientos sucesivos).
 *
 * @param {number[][]} A matriz de coeficientes 3x3
 * @param {number[]} b vector de términos independientes
 * @param {number[]} [x0=[0,0,0]] vector inicial
 * @param {number} [tolerance=0.001] tolerancia sobre el error relativo porcentual máximo
 * @param {number} [maxIterations=50] máximo de iteraciones
 * @returns {Array<{k:number, x1:number, x2:number, x3:number, error:number|null, isConverged:boolean}>}
 */
export function solveGaussSeidel(A, b, x0 = [0, 0, 0], tolerance = 0.001, maxIterations = 50) {
  return iterate(A, b, x0, tolerance, maxIterations, true);
}

/**
 * Resume el historial de iteraciones para la capa de presentación.
 *
 * @param {Array} history salida de solveJacobi / solveGaussSeidel
 * @returns {{ status:'converged'|'max-iterations'|'diverged', converged:boolean, iterations:number, solution:number[], finalError:number|null, rows:number }}
 */
export function summarize(history) {
  const last = history[history.length - 1];
  const diverged = !Number.isFinite(last.error) && last.error !== null;

  let status = 'max-iterations';
  if (last.isConverged) status = 'converged';
  else if (diverged) status = 'diverged';

  return {
    status,
    converged: last.isConverged,
    iterations: last.k,
    solution: [last.x1, last.x2, last.x3],
    finalError: last.error,
    rows: history.length,
  };
}

/**
 * Calcula el vector residual r = b - A·x, útil para verificar la calidad
 * de la solución obtenida de forma independiente al criterio de parada.
 *
 * @param {number[][]} A
 * @param {number[]} b
 * @param {number[]} x
 * @returns {number[]} residual redondeado a 6 decimales
 */
export function residual(A, b, x) {
  return Array.from({ length: SIZE }, (_, i) => {
    let value = b[i];
    for (let j = 0; j < SIZE; j += 1) value -= A[i][j] * x[j];
    return round6(value);
  });
}
