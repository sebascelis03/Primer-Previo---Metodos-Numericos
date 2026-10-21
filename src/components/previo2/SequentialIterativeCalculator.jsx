import { useState } from 'react';
import { RefreshCw, TableProperties } from 'lucide-react';
import CalculatorLayout from './CalculatorLayout.jsx';
import { ActionRow, ExpressionField, NumberField, StopCriteriaFields } from './FormControls.jsx';
import { ConvergenceCard, ErrorBanner, MethodEmptyState } from './ResultCards.jsx';
import { errorTone, fmt, fmtPercent, parseField } from './format.js';
import { solveFixedPoint } from '../../utils/nonlinearMethods.js';

/** Ejemplo académico: punto fijo de g(x) = (e⁻ˣ + x)/2, raíz de e⁻ˣ − x = 0. */
const EXAMPLE = {
  gExpr: '(exp(-x) + x)/2',
  x0: '1.5',
  tolerance: '0.001',
  maxIterations: '50',
};

const EXAMPLES = ['(exp(-x) + x)/2', 'sqrt((x+5)/2)', '(cos(x) + 1)/2', 'exp(-x)', '(x^2 + 2)/3'];

const FORMULAS = [
  {
    name: 'Iteración de punto fijo',
    accent: 'text-indigo-300',
    border: 'border-indigo-500/20 bg-indigo-500/10',
    formula: 'x₍ₖ₊₁₎ = g(xₖ)',
    note: 'La ecuación f(x) = 0 se reescribe como x = g(x) y cada valor obtenido alimenta la siguiente iteración.',
  },
  {
    name: 'Condición de convergencia',
    accent: 'text-cyan-300',
    border: 'border-cyan-500/20 bg-cyan-500/10',
    formula: '| g′(x) | < 1   en un entorno de la raíz',
    note: 'Si la pendiente de g supera la unidad la sucesión se aleja del punto fijo y el método diverge: hay que replantear g(x).',
  },
];

/**
 * Calculadora del método iterativo secuencial (punto fijo o sustitución
 * sucesiva) para ecuaciones no lineales de una variable.
 */
export default function SequentialIterativeCalculator() {
  const [gExpr, setGExpr] = useState(EXAMPLE.gExpr);
  const [x0, setX0] = useState(EXAMPLE.x0);
  const [tolerance, setTolerance] = useState(EXAMPLE.tolerance);
  const [maxIterations, setMaxIterations] = useState(EXAMPLE.maxIterations);

  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setGExpr('');
    setX0('');
    setTolerance('0.001');
    setMaxIterations('50');
    setResult(null);
    setErrorMessage('');
  };

  const handleLoadExample = () => {
    setGExpr(EXAMPLE.gExpr);
    setX0(EXAMPLE.x0);
    setTolerance(EXAMPLE.tolerance);
    setMaxIterations(EXAMPLE.maxIterations);
    setResult(null);
    setErrorMessage('');
  };

  const handleSolve = () => {
    setErrorMessage('');

    const start = parseField(x0);
    const tol = parseField(tolerance);
    const limit = parseField(maxIterations);

    if (String(gExpr).trim() === '') {
      setResult(null);
      setErrorMessage('Escriba la función g(x) que se iterará, por ejemplo (exp(-x) + x)/2.');
      return;
    }
    if (!Number.isFinite(start)) {
      setResult(null);
      setErrorMessage('El valor inicial x₀ debe ser un número real válido.');
      return;
    }

    try {
      setResult({
        tolerance: tol,
        ...solveFixedPoint({ gExpr, x0: start, tol, maxIter: limit }),
      });
    } catch (error) {
      setResult(null);
      setErrorMessage(error.message);
    }
  };

  const inputs = (
    <section className="card animate-rise p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
          <RefreshCw className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-100">Iterativo secuencial</h2>
          <p className="text-sm text-slate-400">
            Reescriba <span className="font-mono font-semibold text-slate-300">f(x) = 0</span> como{' '}
            <span className="font-mono font-semibold text-slate-300">x = g(x)</span> e itere desde un valor inicial.
          </p>
        </div>
      </header>

      <div className="grid gap-5">
        <ExpressionField
          id="fp-g"
          label="Función de iteración"
          prefix="g(x) ="
          value={gExpr}
          onChange={setGExpr}
          placeholder="(exp(-x) + x)/2"
          examples={EXAMPLES}
        />

        <NumberField
          id="fp-x0"
          label="Valor inicial x₀"
          value={x0}
          onChange={setX0}
          hint="Punto de arranque de la sucesión."
        />

        <StopCriteriaFields
          idPrefix="fp"
          tolerance={tolerance}
          maxIterations={maxIterations}
          onToleranceChange={setTolerance}
          onMaxIterationsChange={setMaxIterations}
        />

        <ActionRow
          primaryLabel="Calcular raíz"
          onSolve={handleSolve}
          onLoadExample={handleLoadExample}
          onReset={handleReset}
        />
      </div>
    </section>
  );

  const results = (
    <>
      {errorMessage ? <ErrorBanner title="No fue posible iterar g(x)" message={errorMessage} /> : null}

      {!result && !errorMessage ? (
        <MethodEmptyState
          title="Sin resultados todavía"
          description="Defina g(x) y un valor inicial x₀ para ver la tabla de iteraciones, el error relativo porcentual y la raíz aproximada."
          formulas={FORMULAS}
          stopCriteria={{
            title: 'Criterio de parada',
            formula: 'εₐ = | (x₍ₖ₊₁₎ − xₖ) / x₍ₖ₊₁₎ | × 100 % ≤ tolerancia',
            note: 'El proceso se detiene cuando el error relativo porcentual entre dos aproximaciones consecutivas cae por debajo de la tolerancia, al alcanzar el máximo de iteraciones o al detectarse divergencia.',
          }}
        />
      ) : null}

      {result ? (
        <>
          <ConvergenceCard
            status={result.status}
            title="Raíz aproximada por punto fijo"
            message={result.message}
            rootLabel="x*"
            rootValue={fmt(result.root)}
            checkLabel={`Comprobación: g(x*) = ${fmt(result.check)}  ·  x* = ${fmt(result.root)}`}
            metrics={[
              { label: 'Iteraciones', value: String(result.iterations) },
              { label: 'Error final', value: `${fmtPercent(result.history[result.history.length - 1].error)} %` },
              { label: 'Tolerancia', value: `${result.tolerance} %` },
            ]}
          />

          <section className="card animate-rise overflow-hidden">
            <header className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3.5 sm:px-5">
              <TableProperties className="size-4 shrink-0 text-white" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-white">Tabla de iteraciones</h3>
                <p className="truncate text-xs text-white/80">Sustitución sucesiva x₍ₖ₊₁₎ = g(xₖ)</p>
              </div>
            </header>

            <div className="scrollbar-slim max-h-[26rem] overflow-auto">
              <table className="w-full border-collapse font-mono text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur">
                  <tr className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                    <th scope="col" className="px-3 py-2.5 text-left font-sans">k</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">xₖ</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">g(xₖ) = x₍ₖ₊₁₎</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">Δx</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">Error (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.history.map((row) => (
                    <tr
                      key={row.k}
                      className={`tabular transition-colors ${
                        row.isConverged
                          ? 'animate-converge border-l-2 border-emerald-400 bg-emerald-500/10 font-semibold'
                          : 'odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5'
                      }`}
                    >
                      <th scope="row" className="px-3 py-2 text-left font-sans text-xs font-bold text-slate-400">
                        {row.k}
                      </th>
                      <td className="px-3 py-2 text-right text-slate-200">{fmt(row.xk)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{fmt(row.gxk)}</td>
                      <td className="px-3 py-2 text-right text-slate-400">{fmt(row.delta)}</td>
                      <td className={`px-3 py-2 text-right ${errorTone(row.error, result.tolerance)}`}>
                        {fmtPercent(row.error)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500 sm:px-5">
              Δx = g(xₖ) − xₖ mide el desplazamiento de cada paso; cuando tiende a cero la sucesión alcanzó el punto fijo.
            </footer>
          </section>
        </>
      ) : null}
    </>
  );

  return <CalculatorLayout inputs={inputs} results={results} />;
}
