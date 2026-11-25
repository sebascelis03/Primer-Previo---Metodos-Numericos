import { useState } from 'react';
import { BookOpen, CircleAlert, CircleCheckBig, MousePointerClick, TrendingDown, TriangleAlert, X } from 'lucide-react';
import { DECIMALS, relativeError, round6 } from '../../utils/numericalMethods.js';

const ACCENTS = {
  indigo: {
    head: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
    ring: 'border-indigo-500/20',
    solution: 'text-indigo-300',
  },
  cyan: {
    head: 'bg-gradient-to-r from-cyan-600 to-cyan-500',
    ring: 'border-cyan-500/20',
    solution: 'text-cyan-300',
  },
};

const STATUS = {
  converged: {
    icon: CircleCheckBig,
    text: 'Convergió',
    className: 'bg-emerald-500/20 text-emerald-300',
  },
  'max-iterations': {
    icon: TriangleAlert,
    text: 'Máx. iteraciones',
    className: 'bg-amber-500/20 text-amber-200',
  },
  diverged: {
    icon: CircleAlert,
    text: 'Divergió',
    className: 'bg-rose-500/20 text-rose-200',
  },
};

const SUB = ['₁', '₂', '₃'];

/** Formatea un valor a 6 decimales fijos; marca los no finitos como ∞. */
const fmt = (value) => {
  if (value === null || value === undefined) return '—';
  if (!Number.isFinite(value)) return '∞';
  return value.toFixed(DECIMALS);
};

/** Color del error según su magnitud, para leer la convergencia de un vistazo. */
const errorTone = (error, tolerance) => {
  if (error === null) return 'text-slate-500';
  if (!Number.isFinite(error)) return 'text-rose-400 font-semibold';
  if (error <= tolerance) return 'text-emerald-400 font-semibold';
  if (error < 1) return 'text-slate-300';
  return 'text-amber-400';
};

/**
 * Construye el desarrollo paso a paso de la iteración `k` seleccionada,
 * diferenciando si cada variable sustituida proviene de la iteración anterior
 * (Jacobi) o de la iteración actual recién calculada (Gauss-Seidel).
 */
function buildIterationStep(A, b, history, k, isGaussSeidel) {
  if (!Array.isArray(A) || !Array.isArray(b) || k < 1 || k >= history.length) return null;

  const prevRow = history[k - 1];
  const currRow = history[k];
  const prevVec = [prevRow.x1, prevRow.x2, prevRow.x3];
  const currVec = [currRow.x1, currRow.x2, currRow.x3];

  const steps = [0, 1, 2].map((i) => {
    const others = [0, 1, 2].filter((j) => j !== i);
    const terms = others.map((j) => {
      const fromCurrent = isGaussSeidel && j < i;
      const val = fromCurrent ? currVec[j] : prevVec[j];
      return {
        j,
        varName: `x${SUB[j]}`,
        iterTag: fromCurrent ? `(${k})` : `(${k - 1})`,
        fromCurrent,
        coef: A[i][j],
        val,
      };
    });

    const err = round6(relativeError(currVec[i], prevVec[i]));

    return {
      i,
      varName: `x${SUB[i]}`,
      bi: b[i],
      aii: A[i][i],
      terms,
      prevVal: prevVec[i],
      newVal: currVec[i],
      err,
    };
  });

  return { k, steps, maxError: currRow.error };
}

/**
 * Tabla dinámica de iteraciones: k | x1 | x2 | x3 | Error (%) con desglose
 * paso a paso al hacer clic en cualquier fila k >= 1.
 */
export default function ResultsTable({
  title,
  subtitle,
  accent = 'indigo',
  isGaussSeidel = false,
  matrixNum,
  vectorNum,
  history,
  summary,
  tolerance,
  residualVector,
}) {
  const [selectedK, setSelectedK] = useState(null);

  if (!history || history.length === 0) return null;

  const tone = ACCENTS[accent] ?? ACCENTS.indigo;
  const status = STATUS[summary.status];
  const StatusIcon = status.icon;

  const stepDetail =
    selectedK !== null ? buildIterationStep(matrixNum, vectorNum, history, selectedK, isGaussSeidel) : null;

  return (
    <section className={`card animate-rise overflow-hidden ${tone.ring}`}>
      <header className={`flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5 ${tone.head}`}>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-white">{title}</h3>
          {subtitle ? <p className="truncate text-xs text-white/80">{subtitle}</p> : null}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
          <StatusIcon className="size-3.5" aria-hidden="true" />
          {status.text}
        </span>
      </header>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 bg-white/5">
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Iteraciones</p>
          <p className="font-mono text-lg font-bold text-slate-100 tabular">{summary.iterations}</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Error final</p>
          <p className="font-mono text-lg font-bold text-slate-100 tabular">
            {Number.isFinite(summary.finalError) ? `${summary.finalError}%` : '∞'}
          </p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Tolerancia</p>
          <p className="font-mono text-lg font-bold text-slate-100 tabular">{tolerance}%</p>
        </div>
      </div>

      {/* Guía para el estudiante */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-slate-900/50 px-4 py-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <MousePointerClick className="size-3.5 text-indigo-400" aria-hidden="true" />
          Haz clic en cualquier iteración <strong className="text-slate-200">k ≥ 1</strong> para ver su reemplazo paso a paso.
        </span>
        {selectedK !== null ? (
          <button
            type="button"
            onClick={() => setSelectedK(null)}
            className="text-[11px] font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Cerrar paso a paso
          </button>
        ) : null}
      </div>

      {/* Tabla de iteraciones */}
      <div className="scrollbar-slim max-h-[26rem] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-800/95 backdrop-blur">
            <tr className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">
              <th scope="col" className="px-3 py-2.5 text-left">k</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₁</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₂</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₃</th>
              <th scope="col" className="px-3 py-2.5 text-right">Error (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((row) => {
              const isSelected = selectedK === row.k;
              const isClickable = row.k >= 1;

              return (
                <tr
                  key={row.k}
                  onClick={() => {
                    if (!isClickable) return;
                    setSelectedK((prev) => (prev === row.k ? null : row.k));
                  }}
                  title={isClickable ? `Ver desarrollo paso a paso de la iteración k = ${row.k}` : 'Vector inicial x⁽⁰⁾'}
                  className={`font-mono tabular transition-colors ${isClickable ? 'cursor-pointer' : ''} ${
                    isSelected
                      ? 'border-l-2 border-indigo-400 bg-indigo-500/20 font-semibold'
                      : row.isConverged
                        ? 'animate-converge border-l-2 border-emerald-400 bg-emerald-500/10 font-semibold hover:bg-emerald-500/15'
                        : 'odd:bg-white/[0.02] even:bg-transparent hover:bg-white/10'
                  }`}
                >
                  <th scope="row" className="px-3 py-2 text-left font-sans text-xs font-bold text-slate-400">
                    {row.k}
                  </th>
                  <td className="px-3 py-2 text-right text-slate-200">{fmt(row.x1)}</td>
                  <td className="px-3 py-2 text-right text-slate-200">{fmt(row.x2)}</td>
                  <td className="px-3 py-2 text-right text-slate-200">{fmt(row.x3)}</td>
                  <td className={`px-3 py-2 text-right ${errorTone(row.error, tolerance)}`}>{fmt(row.error)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Panel desplegable: Desarrollo Paso a Paso de la Iteración k */}
      {stepDetail ? (
        <div className="animate-fade border-t border-indigo-500/30 bg-slate-900/90 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-indigo-400" aria-hidden="true" />
              <h4 className="text-sm font-bold text-slate-100">
                Desarrollo paso a paso · Iteración k = {stepDetail.k} ({isGaussSeidel ? 'Gauss-Seidel' : 'Jacobi'})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedK(null)}
              aria-label="Cerrar desarrollo paso a paso"
              className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mb-3 text-xs text-slate-400">
            {isGaussSeidel
              ? 'En Gauss-Seidel cada variable usa inmediatamente los valores recién calculados en esta misma iteración (resaltados en cyan).'
              : `En Jacobi las tres ecuaciones usan únicamente los valores de la iteración anterior k = ${stepDetail.k - 1}.`}
          </p>

          <div className="grid gap-2.5">
            {stepDetail.steps.map((step) => (
              <div
                key={step.varName}
                className="rounded-xl border border-white/10 bg-slate-950/60 p-3 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-100">
                    {step.varName}
                    <sup>({stepDetail.k})</sup> = ({step.bi}{' '}
                    {step.terms.map((t) => (
                      <span key={t.varName}>
                        − ({t.coef})·
                        <span
                          className={
                            t.fromCurrent
                              ? 'rounded bg-cyan-500/20 px-1 text-cyan-300'
                              : 'rounded bg-indigo-500/15 px-1 text-indigo-300'
                          }
                          title={
                            t.fromCurrent
                              ? `${t.varName}${t.iterTag} recién calculado en k = ${stepDetail.k}`
                              : `${t.varName}${t.iterTag} de la iteración anterior k = ${stepDetail.k - 1}`
                          }
                        >
                          {fmt(t.val)}
                        </span>{' '}
                      </span>
                    ))}
                    ) / {step.aii}
                  </span>

                  <span className="text-sm font-bold text-emerald-300">= {fmt(step.newVal)}</span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-1.5 text-[11px] text-slate-400">
                  <span>
                    ε({step.varName}) = |({fmt(step.newVal)} − {fmt(step.prevVal)}) / {fmt(step.newVal)}| × 100
                  </span>
                  <span className="font-semibold text-slate-300">= {fmt(step.err)} %</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Error de la iteración k = {stepDetail.k}:{' '}
            <span className="font-mono font-bold text-slate-200">
              εₐ = máx(ε(x₁), ε(x₂), ε(x₃)) = {fmt(stepDetail.maxError)} %
            </span>
          </p>
        </div>
      ) : null}

      {/* Solución aproximada */}
      <footer className="border-t border-white/10 bg-white/[0.02] px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingDown className="size-4 text-slate-500" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Solución aproximada</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {summary.solution.map((value, i) => (
            <div key={`sol-${i}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
              <p className="font-mono text-xs text-slate-400">x{['₁', '₂', '₃'][i]}</p>
              <p className={`font-mono text-base font-bold tabular ${tone.solution}`}>{fmt(value)}</p>
            </div>
          ))}
        </div>

        {residualVector ? (
          <p className="mt-3 font-mono text-xs text-slate-500">
            Residual r = b − A·x → [{residualVector.map((value) => fmt(value)).join(', ')}]
          </p>
        ) : null}

        {summary.status === 'max-iterations' ? (
          <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Se alcanzó el límite de iteraciones sin cumplir la tolerancia. Aumente el máximo de iteraciones o revise la
            dominancia diagonal del sistema.
          </p>
        ) : null}

        {summary.status === 'diverged' ? (
          <p className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Los valores crecieron sin control: el método diverge para esta matriz. Reordene las ecuaciones para lograr
            dominancia diagonal.
          </p>
        ) : null}
      </footer>
    </section>
  );
}
