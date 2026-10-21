import { BookOpen, CircleAlert, CircleCheckBig, MousePointerClick, TriangleAlert } from 'lucide-react';
import { STATUS_TONES } from './format.js';

const STATUS_ICONS = {
  converged: CircleCheckBig,
  'max-iterations': TriangleAlert,
  partial: TriangleAlert,
  diverged: CircleAlert,
  'zero-derivative': CircleAlert,
};

/**
 * Aviso en rojo para errores de validación o de sintaxis.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.message
 */
export function ErrorBanner({ title, message }) {
  return (
    <div className="animate-rise flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-xl">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-rose-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-rose-300">{title}</p>
        <p className="mt-0.5 text-sm break-words text-rose-200/80">{message}</p>
      </div>
    </div>
  );
}

/**
 * Tarjeta destacada de convergencia: estado, raíz aproximada, comprobación
 * independiente y métricas de la corrida.
 *
 * @param {object} props
 * @param {'converged'|'max-iterations'|'diverged'|'zero-derivative'|'partial'} props.status
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.rootLabel] notación de la raíz, p. ej. 'x*'
 * @param {string} [props.rootValue] valor formateado de la raíz
 * @param {Array<{label:string, value:string, mono?:boolean}>} [props.metrics]
 * @param {string} [props.checkLabel] texto de la comprobación independiente
 */
export function ConvergenceCard({ status, title, message, rootLabel, rootValue, metrics = [], checkLabel }) {
  const tone = STATUS_TONES[status] ?? STATUS_TONES['max-iterations'];
  const Icon = STATUS_ICONS[status] ?? TriangleAlert;

  return (
    <section className={`animate-rise rounded-2xl border p-5 shadow-lg shadow-slate-950/40 backdrop-blur-xl sm:p-6 ${tone.card}`}>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h3 className="min-w-0 flex-1 text-base font-bold text-slate-100">{title}</h3>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tone.badge}`}>
          <Icon className="size-3.5" aria-hidden="true" />
          {tone.label}
        </span>
      </header>

      {rootValue ? (
        <div className="mb-4 rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3.5 text-center">
          <p className="font-mono text-xs tracking-wide text-slate-400">{rootLabel}</p>
          <p className={`mt-1 font-mono text-2xl font-black break-all tabular sm:text-3xl ${tone.value}`}>{rootValue}</p>
          {checkLabel ? <p className="mt-2 font-mono text-xs break-words text-slate-400">{checkLabel}</p> : null}
        </div>
      ) : null}

      {metrics.length > 0 ? (
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{metric.label}</p>
              <p className={`mt-0.5 font-bold text-slate-100 tabular ${metric.mono === false ? 'text-sm' : 'font-mono text-base'}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <p className={`text-sm leading-relaxed ${tone.text}`}>{message}</p>
    </section>
  );
}

/**
 * Estado vacío pedagógico: recuerda el algoritmo y sus fórmulas mientras el
 * usuario no ha ejecutado ningún cálculo.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {Array<{name:string, formula:string, note:string, accent:string, border:string}>} props.formulas
 * @param {{title:string, formula:string, note:string}} [props.stopCriteria]
 */
export function MethodEmptyState({ title, description, formulas, stopCriteria }) {
  return (
    <section className="card animate-fade p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
          <MousePointerClick className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        <BookOpen className="size-3.5" aria-hidden="true" />
        Fundamento del método
      </div>

      <div className="grid gap-3">
        {formulas.map((item) => (
          <div key={item.name} className={`rounded-xl border p-4 ${item.border}`}>
            <p className={`mb-2 text-sm font-bold ${item.accent}`}>{item.name}</p>
            <p className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-200 sm:text-sm">
              {item.formula}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.note}</p>
          </div>
        ))}
      </div>

      {stopCriteria ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-1 text-sm font-bold text-slate-100">{stopCriteria.title}</p>
          <p className="scrollbar-slim overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-200 sm:text-sm">
            {stopCriteria.formula}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{stopCriteria.note}</p>
        </div>
      ) : null}
    </section>
  );
}
