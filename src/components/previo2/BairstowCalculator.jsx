import { useMemo, useState } from 'react';
import { Dna, Sigma, Superscript } from 'lucide-react';
import CalculatorLayout from './CalculatorLayout.jsx';
import { ActionRow, NumberField, StopCriteriaFields } from './FormControls.jsx';
import { ConvergenceCard, ErrorBanner, MethodEmptyState } from './ResultCards.jsx';
import { errorTone, fmt, fmtPercent, fmtResidual, parseField } from './format.js';
import { formatPolynomial, solveBairstow } from '../../utils/nonlinearMethods.js';

/** Grados de polinomio ofrecidos por el selector. */
const DEGREES = [2, 3, 4, 5];

/** Potencias en superíndice para las insignias de cada coeficiente. */
const SUPERSCRIPTS = ['⁰', '¹', '²', '³', '⁴', '⁵'];

/**
 * Ejemplo clásico de Chapra: P(x) = x⁴ − 3.5x³ + 2.75x² + 2.125x − 3.875,
 * con dos raíces reales y un par complejo conjugado.
 */
const EXAMPLE = {
  degree: 4,
  coefficients: ['1', '-3.5', '2.75', '2.125', '-3.875'],
  r0: '0',
  s0: '0',
  tolerance: '0.001',
  maxIterations: '50',
};

const FORMULAS = [
  {
    name: 'Factor cuadrático buscado',
    accent: 'text-indigo-300',
    border: 'border-indigo-500/20 bg-indigo-500/10',
    formula: 'x² − r·x − s   divide exactamente a P(x)',
    note: 'Bairstow busca los valores de r y s que anulan el resto de la división, de modo que el trinomio sea un factor del polinomio.',
  },
  {
    name: 'Sistema 2×2 de corrección',
    accent: 'text-cyan-300',
    border: 'border-cyan-500/20 bg-cyan-500/10',
    formula: 'c₂·Δr + c₃·Δs = −b₁ ;   c₁·Δr + c₂·Δs = −b₀ ;   D = c₂² − c₁·c₃',
    note: 'Los arreglos b y c salen de una doble división sintética. Resolver el sistema entrega las correcciones Δr y Δs de cada iteración.',
  },
  {
    name: 'Raíces del trinomio',
    accent: 'text-purple-300',
    border: 'border-purple-500/20 bg-purple-500/10',
    formula: 'Dq = r² + 4s ;   x = ( r ± √Dq ) / 2',
    note: 'Si Dq ≥ 0 las dos raíces son reales; si Dq < 0 forman un par complejo conjugado r/2 ± (√|Dq| / 2) i.',
  },
];

/**
 * Representa el factor cuadrático x² − r·x − s con los signos ya resueltos,
 * para que el estudiante lea el trinomio tal como lo escribiría a mano.
 * @param {number} r
 * @param {number} s
 * @returns {string}
 */
function formatQuadratic(r, s) {
  const term = (coefficient, text) => {
    const sign = coefficient < 0 ? '+' : '−';
    return ` ${sign} ${Math.abs(coefficient).toFixed(6)}${text}`;
  };
  return `x²${term(r, 'x')}${term(s, '')}`;
}

/**
 * Texto del factor según su naturaleza: potencia de x para las raíces nulas,
 * binomio para el factor lineal y trinomio para el cuadrático.
 * @param {{kind:string, degree:number, r:number, s:number}} factor
 * @returns {string}
 */
function formatFactor(factor) {
  if (factor.kind === 'zero') return factor.degree > 1 ? `x${SUPERSCRIPTS[factor.degree] ?? ''}` : 'x';
  if (factor.kind === 'linear') return `x ${factor.r < 0 ? '+' : '−'} ${Math.abs(factor.r).toFixed(6)}`;
  return formatQuadratic(factor.r, factor.s);
}

/** Subtítulo que describe el tipo de factor en el encabezado de su tarjeta. */
const FACTOR_KIND_LABEL = {
  zero: ' · raíces nulas',
  linear: ' · lineal',
  quadratic: ' · cuadrático',
};

/**
 * Ajusta la longitud del arreglo de coeficientes al grado elegido,
 * conservando los valores que el usuario ya había escrito.
 * @param {string[]} current
 * @param {number} degree
 * @returns {string[]}
 */
function resizeCoefficients(current, degree) {
  const size = degree + 1;
  if (current.length === size) return current;
  if (current.length > size) return current.slice(current.length - size);
  return [...new Array(size - current.length).fill(''), ...current];
}

/**
 * Calculadora del método de Bairstow: extrae factores cuadráticos de un
 * polinomio de coeficientes reales y entrega todas sus raíces, reales y
 * complejas.
 */
export default function BairstowCalculator() {
  const [degree, setDegree] = useState(EXAMPLE.degree);
  const [coefficients, setCoefficients] = useState(EXAMPLE.coefficients);
  const [r0, setR0] = useState(EXAMPLE.r0);
  const [s0, setS0] = useState(EXAMPLE.s0);
  const [tolerance, setTolerance] = useState(EXAMPLE.tolerance);
  const [maxIterations, setMaxIterations] = useState(EXAMPLE.maxIterations);

  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  /** Vista previa del polinomio, recalculada al editar cualquier coeficiente. */
  const preview = useMemo(() => {
    const values = coefficients.map((raw) => (String(raw).trim() === '' ? 0 : parseField(raw)));
    if (values.some((value) => !Number.isFinite(value))) return null;
    return formatPolynomial(values);
  }, [coefficients]);

  const handleDegreeChange = (next) => {
    setDegree(next);
    setCoefficients((previous) => resizeCoefficients(previous, next));
    setResult(null);
    setErrorMessage('');
  };

  const handleCoefficientChange = (index, value) => {
    setCoefficients((previous) => previous.map((cell, i) => (i === index ? value : cell)));
  };

  const handleReset = () => {
    setDegree(EXAMPLE.degree);
    setCoefficients(new Array(EXAMPLE.degree + 1).fill(''));
    setR0('0');
    setS0('0');
    setTolerance('0.001');
    setMaxIterations('50');
    setResult(null);
    setErrorMessage('');
  };

  const handleLoadExample = () => {
    setDegree(EXAMPLE.degree);
    setCoefficients(EXAMPLE.coefficients);
    setR0(EXAMPLE.r0);
    setS0(EXAMPLE.s0);
    setTolerance(EXAMPLE.tolerance);
    setMaxIterations(EXAMPLE.maxIterations);
    setResult(null);
    setErrorMessage('');
  };

  const handleSolve = () => {
    setErrorMessage('');

    // Un coeficiente vacío se interpreta como cero, salvo el principal.
    const values = coefficients.map((raw) => (String(raw).trim() === '' ? 0 : parseField(raw)));

    if (values.some((value) => !Number.isFinite(value))) {
      setResult(null);
      setErrorMessage('Hay coeficientes con valores no numéricos. Corrija los campos resaltados en rojo.');
      return;
    }
    if (values[0] === 0) {
      setResult(null);
      setErrorMessage(
        `El coeficiente principal a${degree} no puede ser cero: el polinomio dejaría de ser de grado ${degree}. ` +
          'Escriba otro valor o reduzca el grado.'
      );
      return;
    }

    const startR = parseField(r0);
    const startS = parseField(s0);

    if (!Number.isFinite(startR) || !Number.isFinite(startS)) {
      setResult(null);
      setErrorMessage('Los valores iniciales r₀ y s₀ deben ser números reales válidos.');
      return;
    }

    try {
      setResult({
        tolerance: parseField(tolerance),
        polynomial: formatPolynomial(values),
        ...solveBairstow({
          coefficients: values,
          r0: startR,
          s0: startS,
          tol: parseField(tolerance),
          maxIter: parseField(maxIterations),
        }),
      });
    } catch (error) {
      setResult(null);
      setErrorMessage(error.message);
    }
  };

  const inputs = (
    <section className="card animate-rise p-5 sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
          <Dna className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-100">Método de Bairstow</h2>
          <p className="text-sm text-slate-400">
            Extrae factores <span className="font-mono font-semibold text-slate-300">x² − rx − s</span> para hallar todas
            las raíces del polinomio, reales y complejas.
          </p>
        </div>
      </header>

      {/* ---------------- Grado del polinomio ---------------- */}
      <div className="mb-5">
        <span className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Grado del polinomio
        </span>
        <div className="grid grid-cols-4 gap-2" role="group" aria-label="Grado del polinomio">
          {DEGREES.map((option) => {
            const isActive = option === degree;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleDegreeChange(option)}
                className={`rounded-xl border py-2.5 font-mono text-sm font-bold transition active:scale-95 ${
                  isActive
                    ? 'border-transparent bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                n = {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------------- Coeficientes ---------------- */}
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Coeficientes</span>
          <span className="font-mono text-xs text-slate-500">aₙ … a₀</span>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/10 bg-slate-900/40 p-3 sm:p-4">
          {coefficients.map((value, index) => {
            const power = degree - index;
            const raw = String(value).trim();
            const isValid = raw === '' || Number.isFinite(parseField(raw));

            return (
              <div key={`coefficient-${power}`} className="flex items-center gap-2.5">
                <span className="grid w-14 shrink-0 place-items-center rounded-lg border border-indigo-500/25 bg-indigo-500/10 py-1.5 font-mono text-xs font-bold text-indigo-300">
                  x{SUPERSCRIPTS[power]}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck="false"
                  value={value}
                  placeholder="0"
                  aria-label={`Coeficiente de x elevado a ${power}`}
                  onChange={(event) => handleCoefficientChange(index, event.target.value)}
                  className={`field-input text-right ${isValid ? '' : 'matrix-cell-invalid'}`}
                />
              </div>
            );
          })}
        </div>

        {/* Vista previa en tiempo real del polinomio escrito. */}
        <div className="mt-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Sigma className="size-3.5" aria-hidden="true" />
            Polinomio
          </p>
          <p className="scrollbar-slim overflow-x-auto font-mono text-sm whitespace-nowrap text-slate-200">
            {preview === null ? (
              <span className="text-rose-300">Revise los coeficientes: hay valores no numéricos.</span>
            ) : (
              `P(x) = ${preview}`
            )}
          </p>
        </div>
      </div>

      {/* ---------------- Valores iniciales y corte ---------------- */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <NumberField id="bw-r0" label="Valor inicial r₀" value={r0} onChange={setR0} hint="Aproximación inicial de r." />
        <NumberField id="bw-s0" label="Valor inicial s₀" value={s0} onChange={setS0} hint="Aproximación inicial de s." />
      </div>

      <div className="mb-5">
        <StopCriteriaFields
          idPrefix="bw"
          tolerance={tolerance}
          maxIterations={maxIterations}
          onToleranceChange={setTolerance}
          onMaxIterationsChange={setMaxIterations}
        />
      </div>

      <ActionRow
        primaryLabel="Calcular raíces"
        onSolve={handleSolve}
        onLoadExample={handleLoadExample}
        onReset={handleReset}
      />
    </section>
  );

  const results = (
    <>
      {errorMessage ? <ErrorBanner title="No fue posible aplicar Bairstow" message={errorMessage} /> : null}

      {!result && !errorMessage ? (
        <MethodEmptyState
          title="Sin resultados todavía"
          description="Elija el grado, escriba los coeficientes del polinomio y defina r₀ y s₀ para obtener todas las raíces, incluidas las complejas."
          formulas={FORMULAS}
          stopCriteria={{
            title: 'Criterio de parada y deflación',
            formula: 'εr = | Δr / r | × 100 % ≤ tol    y    εs = | Δs / s | × 100 % ≤ tol',
            note: 'Cuando ambos errores cumplen la tolerancia el factor queda hallado; el polinomio se deflaciona con el cociente de la división y el proceso se repite hasta quedar en grado 2 o 1, que se resuelven de forma directa.',
          }}
        />
      ) : null}

      {result ? (
        <>
          <ConvergenceCard
            status={result.status}
            title="Raíces del polinomio"
            message={result.message}
            metrics={[
              { label: 'Grado', value: String(result.degree) },
              { label: 'Raíces halladas', value: String(result.allRoots.length) },
              { label: 'Tolerancia', value: `${result.tolerance} %` },
            ]}
          />

          {/* ---------------- Raíces encontradas ---------------- */}
          <section className="card animate-rise overflow-hidden">
            <header className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-3.5 sm:px-5">
              <Superscript className="size-4 shrink-0 text-white" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-white">Raíces encontradas</h3>
                <p className="truncate font-mono text-xs text-white/80">P(x) = {result.polynomial}</p>
              </div>
            </header>

            <div className="grid gap-2.5 p-4 sm:grid-cols-2 sm:p-5">
              {result.allRoots.map((root) => (
                <div
                  key={root.index}
                  className={`rounded-xl border px-3.5 py-3 ${
                    root.isComplex
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                      : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold">x{root.index}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                      {root.isComplex ? 'Compleja' : 'Real'}
                    </span>
                  </div>
                  <p className="font-mono text-sm font-bold break-all tabular">{root.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">|P(x{root.index})| = {fmtResidual(root.residual)}</p>
                </div>
              ))}
            </div>

            <footer className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-500 sm:px-5">
              |P(xᵢ)| es la comprobación independiente de cada raíz: cuanto más cerca de cero, mejor la aproximación.
            </footer>
          </section>

          {/* ---------------- Factores cuadráticos ---------------- */}
          {result.factors.map((factor) => (
            <section key={factor.factorIndex} className="card animate-rise overflow-hidden">
              <header className="flex flex-wrap items-center gap-2.5 border-b border-white/10 bg-white/5 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-100">
                    Factor {factor.factorIndex}
                    {FACTOR_KIND_LABEL[factor.kind] ?? ''}
                  </h3>
                  <p className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-400">
                    {formatFactor(factor)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    factor.direct
                      ? 'bg-slate-500/20 text-slate-300'
                      : factor.converged
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-200'
                  }`}
                >
                  {factor.direct ? 'Directo' : factor.converged ? 'Convergió' : 'Sin converger'}
                </span>
              </header>

              {/* r, s y el discriminante solo tienen sentido en los factores
                  cuadráticos: el de raíces nulas no proviene de la iteración. */}
              {factor.kind === 'quadratic' ? (
                <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-white/[0.02]">
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">r</p>
                    <p className="font-mono text-sm font-bold text-slate-100 tabular">{fmt(factor.r)}</p>
                  </div>
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">s</p>
                    <p className="font-mono text-sm font-bold text-slate-100 tabular">{fmt(factor.s)}</p>
                  </div>
                  <div className="px-3 py-2.5 text-center">
                    <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Dq = r² + 4s</p>
                    <p
                      className={`font-mono text-sm font-bold tabular ${
                        factor.discriminant < 0 ? 'text-purple-300' : 'text-cyan-300'
                      }`}
                    >
                      {fmt(factor.discriminant)}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Raíces aportadas por este factor */}
              <div className="flex flex-wrap gap-2 px-4 py-3 sm:px-5">
                {factor.roots.map((root, index) => (
                  <span
                    key={`${factor.factorIndex}-root-${index}`}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-xs ${
                      root.isComplex
                        ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                    }`}
                  >
                    {root.imag === 0
                      ? root.real.toFixed(6)
                      : `${root.real.toFixed(6)} ${root.imag > 0 ? '+' : '−'} ${Math.abs(root.imag).toFixed(6)} i`}
                  </span>
                ))}
              </div>

              {factor.iterationsHistory.length > 0 ? (
                <div className="scrollbar-slim max-h-[20rem] overflow-auto border-t border-white/10">
                  <table className="w-full border-collapse font-mono text-xs sm:text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur">
                      <tr className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
                        <th scope="col" className="px-3 py-2.5 text-left font-sans">k</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">r</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">s</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">Δr</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">Δs</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">εr (%)</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-sans">εs (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {factor.iterationsHistory.map((row) => (
                        <tr
                          key={row.k}
                          className={`tabular transition-colors ${
                            row.isConverged
                              ? 'animate-converge border-l-2 border-emerald-400 bg-emerald-500/10 font-semibold'
                              : row.singular
                                ? 'border-l-2 border-amber-400 bg-amber-500/10'
                                : 'odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5'
                          }`}
                        >
                          <th scope="row" className="px-3 py-2 text-left font-sans text-xs font-bold text-slate-400">
                            {row.k}
                          </th>
                          <td className="px-3 py-2 text-right text-slate-200">{fmt(row.r)}</td>
                          <td className="px-3 py-2 text-right text-slate-200">{fmt(row.s)}</td>
                          <td className="px-3 py-2 text-right text-slate-400">{fmt(row.dr)}</td>
                          <td className="px-3 py-2 text-right text-slate-400">{fmt(row.ds)}</td>
                          <td className={`px-3 py-2 text-right ${errorTone(row.errorR, result.tolerance)}`}>
                            {fmtPercent(row.errorR)}
                          </td>
                          <td className={`px-3 py-2 text-right ${errorTone(row.errorS, result.tolerance)}`}>
                            {fmtPercent(row.errorS)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {factor.note ? (
                <p
                  className={`border-t border-white/10 px-4 py-3 text-xs leading-relaxed sm:px-5 ${
                    factor.converged ? 'text-slate-500' : 'bg-amber-500/10 text-amber-200'
                  }`}
                >
                  {factor.note}
                </p>
              ) : null}
            </section>
          ))}
        </>
      ) : null}
    </>
  );

  return <CalculatorLayout inputs={inputs} results={results} />;
}
