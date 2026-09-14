import { CircleAlert, CircleCheckBig, TrendingDown, TriangleAlert } from 'lucide-react';
import { DECIMALS } from '../utils/numericalMethods.js';

const ACCENTS = {
  blue: {
    head: 'bg-blue-600',
    ring: 'border-blue-200',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
    solution: 'text-blue-700',
  },
  emerald: {
    head: 'bg-emerald-600',
    ring: 'border-emerald-200',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    solution: 'text-emerald-700',
  },
};

const STATUS = {
  converged: {
    icon: CircleCheckBig,
    text: 'Convergió',
    className: 'bg-emerald-100 text-emerald-700',
  },
  'max-iterations': {
    icon: TriangleAlert,
    text: 'Máx. iteraciones',
    className: 'bg-amber-100 text-amber-700',
  },
  diverged: {
    icon: CircleAlert,
    text: 'Divergió',
    className: 'bg-rose-100 text-rose-700',
  },
};

/** Formatea un valor a 6 decimales fijos; marca los no finitos como ∞. */
const fmt = (value) => {
  if (value === null || value === undefined) return '—';
  if (!Number.isFinite(value)) return '∞';
  return value.toFixed(DECIMALS);
};

/** Color del error según su magnitud, para leer la convergencia de un vistazo. */
const errorTone = (error, tolerance) => {
  if (error === null) return 'text-slate-400';
  if (!Number.isFinite(error)) return 'text-rose-600 font-semibold';
  if (error <= tolerance) return 'text-emerald-600 font-semibold';
  if (error < 1) return 'text-slate-700';
  return 'text-amber-600';
};

/**
 * Tabla dinámica de iteraciones: k | x1 | x2 | x3 | Error (%).
 */
export default function ResultsTable({ title, subtitle, accent = 'blue', history, summary, tolerance, residualVector }) {
  if (!history || history.length === 0) return null;

  const tone = ACCENTS[accent] ?? ACCENTS.blue;
  const status = STATUS[summary.status];
  const StatusIcon = status.icon;

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
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/70">
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Iteraciones</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular">{summary.iterations}</p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Error final</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular">
            {Number.isFinite(summary.finalError) ? `${summary.finalError}%` : '∞'}
          </p>
        </div>
        <div className="px-3 py-2.5 text-center">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">Tolerancia</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular">{tolerance}%</p>
        </div>
      </div>

      {/* Tabla de iteraciones */}
      <div className="scrollbar-slim max-h-[26rem] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
            <tr className="text-[11px] font-bold tracking-wide text-slate-600 uppercase">
              <th scope="col" className="px-3 py-2.5 text-left">k</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₁</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₂</th>
              <th scope="col" className="px-3 py-2.5 text-right">x₃</th>
              <th scope="col" className="px-3 py-2.5 text-right">Error (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((row) => (
              <tr
                key={row.k}
                className={`font-mono tabular transition-colors ${
                  row.isConverged ? 'bg-emerald-50 font-semibold' : 'odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/50'
                }`}
              >
                <th scope="row" className="px-3 py-2 text-left font-sans text-xs font-bold text-slate-500">
                  {row.k}
                </th>
                <td className="px-3 py-2 text-right text-slate-800">{fmt(row.x1)}</td>
                <td className="px-3 py-2 text-right text-slate-800">{fmt(row.x2)}</td>
                <td className="px-3 py-2 text-right text-slate-800">{fmt(row.x3)}</td>
                <td className={`px-3 py-2 text-right ${errorTone(row.error, tolerance)}`}>{fmt(row.error)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Solución aproximada */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div className="mb-3 flex items-center gap-2">
          <TrendingDown className="size-4 text-slate-400" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Solución aproximada</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {summary.solution.map((value, i) => (
            <div key={`sol-${i}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
              <p className="font-mono text-xs text-slate-500">x{['₁', '₂', '₃'][i]}</p>
              <p className={`font-mono text-base font-bold tabular ${tone.solution}`}>{fmt(value)}</p>
            </div>
          ))}
        </div>

        {residualVector ? (
          <p className="mt-3 font-mono text-xs text-slate-400">
            Residual r = b − A·x → [{residualVector.map((value) => fmt(value)).join(', ')}]
          </p>
        ) : null}

        {summary.status === 'max-iterations' ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Se alcanzó el límite de iteraciones sin cumplir la tolerancia. Aumente el máximo de iteraciones o revise la
            dominancia diagonal del sistema.
          </p>
        ) : null}

        {summary.status === 'diverged' ? (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
            Los valores crecieron sin control: el método diverge para esta matriz. Reordene las ecuaciones para lograr
            dominancia diagonal.
          </p>
        ) : null}
      </footer>
    </section>
  );
}
