import { useMemo, useState } from 'react';
import { CircleAlert, Grid3x3, WifiOff } from 'lucide-react';
import MatrixInput from './components/MatrixInput.jsx';
import DominanceCard from './components/DominanceCard.jsx';
import ResultsTable from './components/ResultsTable.jsx';
import DuelCard from './components/DuelCard.jsx';
import EmptyState from './components/EmptyState.jsx';
import {
  checkDiagonalDominance,
  residual,
  solveGaussSeidel,
  solveJacobi,
  summarize,
} from './utils/numericalMethods.js';

/** Sistema de ejemplo: diagonal dominante, solución exacta (2, 4, 3). */
const EXAMPLE = {
  matrix: [
    ['4', '-1', '1'],
    ['4', '-8', '1'],
    ['-2', '1', '5'],
  ],
  vector: ['7', '-21', '15'],
};

const EMPTY_MATRIX = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

/**
 * Convierte el texto de un campo a número; la cadena vacía cuenta como 0.
 * Se acepta la coma como separador decimal (convención local es-CO).
 */
const toNumber = (raw) => {
  const trimmed = String(raw).trim().replace(',', '.');
  if (trimmed === '') return 0;
  return Number(trimmed);
};

/** true si todos los campos del sistema contienen números reales válidos. */
const areInputsValid = (matrix, vector, initialGuess) =>
  [...matrix.flat(), ...vector, ...initialGuess].every((raw) => Number.isFinite(toNumber(raw)));

export default function App() {
  const [matrix, setMatrix] = useState(EXAMPLE.matrix);
  const [vector, setVector] = useState(EXAMPLE.vector);
  const [initialGuess, setInitialGuess] = useState(['0', '0', '0']);
  const [tolerance, setTolerance] = useState('0.001');
  const [maxIterations, setMaxIterations] = useState('50');

  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  /** Diagnóstico de dominancia diagonal, recalculado al editar la matriz. */
  const diagnosis = useMemo(() => {
    if (!areInputsValid(matrix, vector, initialGuess)) return null;
    return checkDiagonalDominance(matrix.map((row) => row.map(toNumber)));
  }, [matrix, vector, initialGuess]);

  const handleMatrixChange = (i, j, value) => {
    setMatrix((previous) => previous.map((row, ri) => (ri === i ? row.map((cell, ci) => (ci === j ? value : cell)) : row)));
  };

  const handleVectorChange = (i, value) => {
    setVector((previous) => previous.map((cell, index) => (index === i ? value : cell)));
  };

  const handleInitialGuessChange = (i, value) => {
    setInitialGuess((previous) => previous.map((cell, index) => (index === i ? value : cell)));
  };

  const handleReset = () => {
    setMatrix(EMPTY_MATRIX);
    setVector(['', '', '']);
    setInitialGuess(['0', '0', '0']);
    setTolerance('0.001');
    setMaxIterations('50');
    setResults(null);
    setErrorMessage('');
  };

  const handleLoadExample = () => {
    setMatrix(EXAMPLE.matrix);
    setVector(EXAMPLE.vector);
    setInitialGuess(['0', '0', '0']);
    setResults(null);
    setErrorMessage('');
  };

  /**
   * Ejecuta el método seleccionado ('jacobi', 'gauss-seidel' o 'duel')
   * validando previamente todos los datos de entrada.
   */
  const handleSolve = (mode) => {
    setErrorMessage('');

    if (!areInputsValid(matrix, vector, initialGuess)) {
      setResults(null);
      setErrorMessage('Hay celdas con valores no numéricos. Corrija los campos resaltados en rojo.');
      return;
    }

    const tol = toNumber(tolerance);
    const limit = toNumber(maxIterations);

    if (String(tolerance).trim() === '' || !Number.isFinite(tol) || tol < 0) {
      setResults(null);
      setErrorMessage('La tolerancia debe ser un número mayor o igual a cero.');
      return;
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      setResults(null);
      setErrorMessage('El máximo de iteraciones debe ser un número entero entre 1 y 500.');
      return;
    }

    const A = matrix.map((row) => row.map(toNumber));
    const b = vector.map(toNumber);
    const x0 = initialGuess.map(toNumber);

    try {
      const build = (history) => {
        const summary = summarize(history);
        return { history, summary, residualVector: residual(A, b, summary.solution) };
      };

      const jacobi = mode !== 'gauss-seidel' ? build(solveJacobi(A, b, x0, tol, limit)) : null;
      const gaussSeidel = mode !== 'jacobi' ? build(solveGaussSeidel(A, b, x0, tol, limit)) : null;

      setResults({ mode, tolerance: tol, jacobi, gaussSeidel });
    } catch (error) {
      setResults(null);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ---------------- Encabezado ---------------- */}
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <Grid3x3 className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl leading-tight font-black text-slate-900 sm:text-2xl">
              Métodos Iterativos <span className="text-blue-600">3×3</span>
            </h1>
            <p className="text-sm text-slate-500">Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <WifiOff className="size-3.5" aria-hidden="true" />
            100% local
          </span>
        </div>
      </header>

      {/* ---------------- Layout de dos columnas ---------------- */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* Panel de entrada. En escritorio queda fijo al hacer scroll; si el
            panel no cabe en la ventana, se desplaza dentro de sí mismo para que
            los botones de acción siempre sean alcanzables. */}
        <div className="scrollbar-slim no-print lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-1">
          <MatrixInput
            matrix={matrix}
            vector={vector}
            initialGuess={initialGuess}
            tolerance={tolerance}
            maxIterations={maxIterations}
            onMatrixChange={handleMatrixChange}
            onVectorChange={handleVectorChange}
            onInitialGuessChange={handleInitialGuessChange}
            onToleranceChange={setTolerance}
            onMaxIterationsChange={setMaxIterations}
            onSolve={handleSolve}
            onReset={handleReset}
            onLoadExample={handleLoadExample}
            isBusy={false}
          />
        </div>

        {/* Panel de resultados */}
        <div className="flex flex-col gap-5">
          <DominanceCard diagnosis={diagnosis} />

          {errorMessage ? (
            <div className="animate-rise flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-rose-900">No fue posible resolver el sistema</p>
                <p className="mt-0.5 text-sm text-rose-800">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          {!results && !errorMessage ? <EmptyState /> : null}

          {results?.mode === 'duel' ? (
            <DuelCard
              jacobi={results.jacobi}
              gaussSeidel={results.gaussSeidel}
              tolerance={results.tolerance}
            />
          ) : null}

          {results?.jacobi ? (
            <ResultsTable
              title="Método de Jacobi"
              subtitle="Desplazamientos simultáneos"
              accent="blue"
              history={results.jacobi.history}
              summary={results.jacobi.summary}
              residualVector={results.jacobi.residualVector}
              tolerance={results.tolerance}
            />
          ) : null}

          {results?.gaussSeidel ? (
            <ResultsTable
              title="Método de Gauss-Seidel"
              subtitle="Desplazamientos sucesivos"
              accent="emerald"
              history={results.gaussSeidel.history}
              summary={results.gaussSeidel.summary}
              residualVector={results.gaussSeidel.residualVector}
              tolerance={results.tolerance}
            />
          ) : null}
        </div>
      </div>

      <footer className="no-print mt-10 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
        <p>
          Métodos Numéricos · Resultados redondeados a 6 cifras decimales · Aplicación instalable que funciona sin
          conexión
        </p>
      </footer>
    </div>
  );
}
