import { useState } from 'react';
import { TableProperties, Zap } from 'lucide-react';
import CalculatorLayout from './CalculatorLayout.jsx';
import { ActionRow, ExpressionField, NumberField, StopCriteriaFields } from './FormControls.jsx';
import { ConvergenceCard, ErrorBanner, MethodEmptyState } from './ResultCards.jsx';
import { errorTone, fmt, fmtPercent, fmtResidual, parseField } from './format.js';
import { solveNewtonRaphson } from '../../utils/nonlinearMethods.js';

/** Ejemplo clásico: f(x) = x³ − 2x − 5, con raíz real cerca de 2.0945515. */
const EXAMPLE = {
  fExpr: 'x^3 - 2x - 5',
  dfExpr: '3x^2 - 2',
  x0: '2',
  tolerance: '0.001',
  maxIterations: '50',
};

const F_EXAMPLES = ['x^3 - 2x - 5', 'exp(-x) - x', 'x^2 - 4', 'cos(x) - x', 'ln(x) + x^2 - 3'];

const FORMULAS = [
  {
    name: 'Fórmula de Newton-Raphson',
    accent: 'text-indigo-300',
    border: 'border-indigo-500/20 bg-indigo-500/10',
    formula: 'x₍ₖ₊₁₎ = xₖ − f(xₖ) / f′(xₖ)',
    note: 'Cada iteración reemplaza la curva por su recta tangente y toma el corte de esa tangente con el eje x como nueva aproximación.',
  },
  {
    name: 'Derivada numérica (diferencias centrales)',
    accent: 'text-cyan-300',
    border: 'border-cyan-500/20 bg-cyan-500/10',
    formula: "f′(x) ≈ ( f(x + h) − f(x − h) ) / (2h) ,   h = 1×10⁻⁶",
    note: 'Si no se escribe f′(x) de forma manual, la pendiente se aproxima con este esquema de segundo orden.',
  },
];

/**
 * Calculadora del método de Newton-Raphson, con derivada analítica
 * (ingresada por el usuario) o numérica por diferencias finitas centrales.
 */
export default function NewtonRaphsonCalculator() {
  const [fExpr, setFExpr] = useState(EXAMPLE.fExpr);
  const [dfExpr, setDfExpr] = useState('');
  const [useAutoDerivative, setUseAutoDerivative] = useState(true);
  const [x0, setX0] = useState(EXAMPLE.x0);
  const [tolerance, setTolerance] = useState(EXAMPLE.tolerance);
  const [maxIterations, setMaxIterations] = useState(EXAMPLE.maxIterations);

  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setFExpr('');
    setDfExpr('');
    setUseAutoDerivative(true);
    setX0('');
    setTolerance('0.001');
    setMaxIterations('50');
    setResult(null);
    setErrorMessage('');
  };

  const handleLoadExample = () => {
    setFExpr(EXAMPLE.fExpr);
    setDfExpr(EXAMPLE.dfExpr);
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

    if (String(fExpr).trim() === '') {
      setResult(null);
      setErrorMessage('Escriba la función f(x) cuya raíz se busca, por ejemplo x^3 - 2x - 5.');
      return;
    }
    if (!useAutoDerivative && String(dfExpr).trim() === '') {
      setResult(null);
      setErrorMessage("Escriba la derivada f'(x) o active el cálculo automático de la derivada.");
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
        ...solveNewtonRaphson({ fExpr, dfExpr, useAutoDerivative, x0: start, tol, maxIter: limit }),
      });
    } catch (error) {
      setResult(null);
      setErrorMessage(error.message);
    }
  };

  const inputs = (
    <section className="card animate-rise p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
          <Zap className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-100">Newton-Raphson</h2>
          <p className="text-sm text-slate-400">
            Aproxima la raíz de <span className="font-mono font-semibold text-slate-300">f(x) = 0</span> siguiendo la
            recta tangente en cada paso.
          </p>
        </div>
      </header>

      <div className="grid gap-5">
        <ExpressionField
          id="nr-f"
          label="Función"
          prefix="f(x) ="
          value={fExpr}
          onChange={setFExpr}
          placeholder="x^3 - 2x - 5"
          examples={F_EXAMPLES}
        />

        {/* Interruptor entre derivada numérica y derivada analítica. */}
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200">Calcular derivada automáticamente</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {useAutoDerivative
                  ? 'Se usa la aproximación por diferencias finitas centrales con h = 1×10⁻⁶.'
                  : "Se usará la expresión de f'(x) que escriba a continuación."}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={useAutoDerivative}
              onClick={() => setUseAutoDerivative((active) => !active)}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                useAutoDerivative ? 'bg-gradient-to-r from-indigo-500 to-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span className="sr-only">Calcular derivada automáticamente</span>
              <span
                aria-hidden="true"
                className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  useAutoDerivative ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!useAutoDerivative ? (
            <div className="mt-3.5 border-t border-white/10 pt-3.5">
              <ExpressionField
                id="nr-df"
                label="Derivada manual"
                prefix="f'(x) ="
                value={dfExpr}
                onChange={setDfExpr}
                placeholder="3x^2 - 2"
                hint="Debe ser la derivada exacta de f(x); un error aquí desvía la convergencia."
              />
            </div>
          ) : null}
        </div>

        <NumberField
          id="nr-x0"
          label="Valor inicial x₀"
          value={x0}
          onChange={setX0}
          hint="Cuanto más cerca de la raíz, menos iteraciones."
        />

        <StopCriteriaFields
          idPrefix="nr"
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
      {errorMessage ? <ErrorBanner title="No fue posible aplicar Newton-Raphson" message={errorMessage} /> : null}

      {!result && !errorMessage ? (
        <MethodEmptyState
          title="Sin resultados todavía"
          description="Defina f(x) y un valor inicial x₀ para ver la tabla de tangentes, el error relativo porcentual y la raíz aproximada."
          formulas={FORMULAS}
          stopCriteria={{
            title: 'Criterio de parada',
            formula: 'εₐ = | (x₍ₖ₊₁₎ − xₖ) / x₍ₖ₊₁₎ | × 100 % ≤ tolerancia',
            note: 'El método también se detiene si |f′(xₖ)| se vuelve prácticamente nulo (tangente horizontal) o si las aproximaciones divergen.',
          }}
        />
      ) : null}

      {result ? (
        <>
          <ConvergenceCard
            status={result.status}
            title="Raíz aproximada por Newton-Raphson"
            message={result.message}
            rootLabel="x*"
            rootValue={fmt(result.root)}
            checkLabel={`Residual: f(x*) = ${fmtResidual(result.residual)}  ·  derivada ${result.derivativeMode}`}
            metrics={[
              { label: 'Iteraciones', value: String(result.iterations) },
              { label: 'Residual |f(x*)|', value: fmtResidual(Math.abs(result.residual)) },
              { label: 'Tolerancia', value: `${result.tolerance} %` },
            ]}
          />

          <section className="card animate-rise overflow-hidden">
            <header className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 px-4 py-3.5 sm:px-5">
              <TableProperties className="size-4 shrink-0 text-white" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-white">Tabla de iteraciones</h3>
                <p className="truncate text-xs text-white/80">x₍ₖ₊₁₎ = xₖ − f(xₖ) / f′(xₖ)</p>
              </div>
            </header>

            <div className="scrollbar-slim max-h-[26rem] overflow-auto">
              <table className="w-full border-collapse font-mono text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur">
                  <tr className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                    <th scope="col" className="px-3 py-2.5 text-left font-sans">k</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">xₖ</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">f(xₖ)</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">f′(xₖ)</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-sans">x₍ₖ₊₁₎</th>
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
                      <td className="px-3 py-2 text-right text-slate-400">{fmt(row.fxk)}</td>
                      <td className="px-3 py-2 text-right text-slate-400">{fmt(row.dfxk)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{fmt(row.xnext)}</td>
                      <td className={`px-3 py-2 text-right ${errorTone(row.error, result.tolerance)}`}>
                        {fmtPercent(row.error)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500 sm:px-5">
              f(xₖ) debe acercarse a cero y f′(xₖ) mantenerse lejos de cero: ahí está la salud de la iteración.
            </footer>
          </section>
        </>
      ) : null}
    </>
  );

  return <CalculatorLayout inputs={inputs} results={results} />;
}
