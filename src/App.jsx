import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleAlert, Grid3x3, Menu, X } from 'lucide-react';
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

/** Integrantes del equipo, mostrados en el menú del encabezado. */
const TEAM = [
  'Andres Esteban Sandoval Carreño',
  'Jhoan Sebastian Celis Pabon',
  'Zharick Nicoll Acevedo Ascanio',
];

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

  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const teamMenuRef = useRef(null);

  /** Cierra el menú del equipo al hacer clic fuera de él o al presionar Escape. */
  useEffect(() => {
    if (!isTeamMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!teamMenuRef.current?.contains(event.target)) setIsTeamMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsTeamMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTeamMenuOpen]);

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
      <header className="relative mb-8 py-8 text-center sm:mb-10 sm:py-12">
        {/* Halo decorativo detrás del ícono: pura luz de fondo, nunca captura clics. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center">
          <div className="size-64 -translate-y-1/4 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
        </div>

        {/* Menú del equipo: anclado a la esquina para no descentrar el hero.
            Se cierra con el propio botón, con Escape o al hacer clic fuera.
            El z-40 mantiene su dropdown por encima del thead sticky de las tablas. */}
        <div ref={teamMenuRef} className="no-print absolute top-4 right-0 z-40">
          <button
            type="button"
            onClick={() => setIsTeamMenuOpen((open) => !open)}
            aria-expanded={isTeamMenuOpen}
            aria-haspopup="menu"
            aria-label={isTeamMenuOpen ? 'Cerrar menú del equipo' : 'Abrir menú del equipo'}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 hover:text-slate-100 active:scale-95"
          >
            {isTeamMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>

          {isTeamMenuOpen ? (
            <div
              role="menu"
              className="animate-fade absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-white/10 bg-slate-800/90 p-4 text-left shadow-2xl shadow-slate-950/60 backdrop-blur-xl"
            >
              <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Equipo</p>

              <ul className="space-y-2.5">
                {TEAM.map((member) => (
                  <li key={member} className="flex items-start gap-2.5 text-sm leading-snug text-slate-200">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                      aria-hidden="true"
                    />
                    {member}
                  </li>
                ))}
              </ul>

              <p className="mt-3.5 border-t border-white/10 pt-3 text-xs text-slate-500">
                Métodos Numéricos · Primer Previo · 2026-2
              </p>
            </div>
          ) : null}
        </div>

        {/* Contenido del hero, apilado y centrado sobre el halo. */}
        <div className="animate-rise relative z-10 flex flex-col items-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white ring-2 shadow-lg ring-indigo-400/30 shadow-indigo-500/20 sm:size-20">
            <Grid3x3 className="size-8 sm:size-10" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-3xl leading-tight font-black text-balance sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Métodos Iterativos
            </span>{' '}
            <span className="text-cyan-400">3×3</span>
          </h1>

          <p className="mt-2 max-w-lg text-base text-slate-400 sm:text-lg">
            Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel
          </p>

          {/* El tracking se reduce en móvil para que el chip no desborde
              pantallas estrechas (a 0.25em el texto supera los 360 px). */}
          <p className="mt-3 max-w-full rounded-full border border-white/10 px-3 py-1.5 text-[10px] tracking-[0.16em] text-slate-500 uppercase sm:px-4 sm:text-xs sm:tracking-[0.25em]">
            FESC · Ingeniería de Software · 2026-2
          </p>
        </div>

        {/* Separador que cierra el hero y lo despega del contenido. */}
        <div
          aria-hidden="true"
          className="relative z-10 mt-8 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
        />
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
            <div className="animate-rise flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-xl">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-rose-300">No fue posible resolver el sistema</p>
                <p className="mt-0.5 text-sm text-rose-200/80">{errorMessage}</p>
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
              accent="indigo"
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
              accent="cyan"
              history={results.gaussSeidel.history}
              summary={results.gaussSeidel.summary}
              residualVector={results.gaussSeidel.residualVector}
              tolerance={results.tolerance}
            />
          ) : null}
        </div>
      </div>

      <footer className="no-print mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
        <p>
          Métodos Numéricos · Resultados redondeados a 6 cifras decimales · Aplicación instalable que funciona sin
          conexión
        </p>
      </footer>
    </div>
  );
}
