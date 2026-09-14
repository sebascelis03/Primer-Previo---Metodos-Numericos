import { Calculator, Eraser, FlaskConical, Play, Swords, Zap } from 'lucide-react';

const VARIABLES = ['x₁', 'x₂', 'x₃'];

/**
 * Determina si una cadena representa un número real válido.
 * Se acepta la cadena vacía mientras el usuario escribe (se interpreta como 0).
 */
const isValidNumber = (raw) => {
  const value = String(raw).trim().replace(',', '.');
  return value === '' || Number.isFinite(Number(value));
};

/**
 * Panel de entrada: matriz aumentada [A | b], vector inicial, parámetros
 * de corte y botones de acción.
 */
export default function MatrixInput({
  matrix,
  vector,
  initialGuess,
  tolerance,
  maxIterations,
  onMatrixChange,
  onVectorChange,
  onInitialGuessChange,
  onToleranceChange,
  onMaxIterationsChange,
  onSolve,
  onReset,
  onLoadExample,
  isBusy,
}) {
  return (
    <section className="card animate-rise p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600/10 text-blue-600">
          <Calculator className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sistema de ecuaciones</h2>
          <p className="text-sm text-slate-500">
            Ingrese los coeficientes de la matriz <span className="font-mono font-semibold">A</span> y el vector de
            términos independientes <span className="font-mono font-semibold">b</span>.
          </p>
        </div>
      </header>

      {/* ---------------- Matriz aumentada [A | b] ---------------- */}
      <div className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Matriz aumentada</span>
          <span className="font-mono text-xs text-slate-400">A · x = b</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
          {/* Encabezado de columnas */}
          <div className="mb-2 grid grid-cols-[repeat(3,minmax(0,1fr))_1.25rem_minmax(0,1fr)] items-center gap-2">
            {VARIABLES.map((label) => (
              <span key={label} className="text-center text-xs font-semibold text-slate-500">
                {label}
              </span>
            ))}
            <span aria-hidden="true" />
            <span className="text-center text-xs font-semibold text-slate-500">b</span>
          </div>

          {matrix.map((row, i) => (
            <div
              key={`row-${i}`}
              className="mb-2 grid grid-cols-[repeat(3,minmax(0,1fr))_1.25rem_minmax(0,1fr)] items-center gap-2 last:mb-0"
            >
              {row.map((cell, j) => (
                <input
                  key={`a-${i}-${j}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck="false"
                  value={cell}
                  aria-label={`Coeficiente a${i + 1}${j + 1}`}
                  onChange={(event) => onMatrixChange(i, j, event.target.value)}
                  className={`matrix-cell ${isValidNumber(cell) ? '' : 'matrix-cell-invalid'} ${
                    i === j ? 'border-blue-300 bg-blue-50/60 font-bold' : ''
                  }`}
                />
              ))}

              <span className="text-center text-lg font-light text-slate-300" aria-hidden="true">
                |
              </span>

              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                spellCheck="false"
                value={vector[i]}
                aria-label={`Término independiente b${i + 1}`}
                onChange={(event) => onVectorChange(i, event.target.value)}
                className={`matrix-cell border-emerald-300 bg-emerald-50/60 ${
                  isValidNumber(vector[i]) ? '' : 'matrix-cell-invalid'
                }`}
              />
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Las celdas resaltadas en azul son la diagonal principal (a<sub>ii</sub>), la base del despeje iterativo.
        </p>
      </div>

      {/* ---------------- Parámetros ---------------- */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tolerance" className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Tolerancia (% error)
          </label>
          <input
            id="tolerance"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={tolerance}
            onChange={(event) => onToleranceChange(event.target.value)}
            className={`field-input ${isValidNumber(tolerance) ? '' : 'matrix-cell-invalid'}`}
          />
          <p className="mt-1 text-xs text-slate-400">Se compara contra el error relativo porcentual máximo.</p>
        </div>

        <div>
          <label
            htmlFor="max-iterations"
            className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase"
          >
            Máx. iteraciones
          </label>
          <input
            id="max-iterations"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={maxIterations}
            onChange={(event) => onMaxIterationsChange(event.target.value.replace(/[^\d]/g, ''))}
            className="field-input"
          />
          <p className="mt-1 text-xs text-slate-400">Corte de seguridad si el método no converge.</p>
        </div>
      </div>

      {/* ---------------- Vector inicial ---------------- */}
      <div className="mb-6">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Vector inicial x⁽⁰⁾
        </span>
        <div className="grid grid-cols-3 gap-2">
          {initialGuess.map((value, i) => (
            <div key={`x0-${i}`} className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs text-slate-400">
                {VARIABLES[i]}
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={value}
                aria-label={`Valor inicial de ${VARIABLES[i]}`}
                onChange={(event) => onInitialGuessChange(i, event.target.value)}
                className={`field-input pl-9 text-right ${isValidNumber(value) ? '' : 'matrix-cell-invalid'}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Acciones ---------------- */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSolve('jacobi')}
          className="btn bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
        >
          <Play className="size-4" aria-hidden="true" />
          Resolver por Jacobi
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSolve('gauss-seidel')}
          className="btn bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
        >
          <Zap className="size-4" aria-hidden="true" />
          Resolver por Gauss-Seidel
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onSolve('duel')}
          className="btn bg-slate-900 text-white shadow-sm shadow-slate-900/20 hover:bg-slate-800 sm:col-span-2"
        >
          <Swords className="size-4" aria-hidden="true" />
          Modo Duelo (Comparar)
        </button>

        <button
          type="button"
          onClick={onLoadExample}
          className="btn border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <FlaskConical className="size-4" aria-hidden="true" />
          Cargar ejemplo
        </button>

        <button
          type="button"
          onClick={onReset}
          className="btn border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <Eraser className="size-4" aria-hidden="true" />
          Limpiar
        </button>
      </div>
    </section>
  );
}
