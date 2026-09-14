import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';

/**
 * Paleta por estado del diagnóstico de dominancia diagonal.
 * verde  -> cumple el criterio (convergencia garantizada)
 * ámbar  -> no cumple (puede no converger)
 * rojo   -> cero en la diagonal (el método no es aplicable)
 */
const STYLES = {
  ok: {
    icon: CheckCircle2,
    wrapper: 'border-emerald-500/20 bg-emerald-500/10',
    badge: 'bg-emerald-500 text-slate-950',
    title: 'text-emerald-300',
    body: 'text-emerald-100/80',
    accent: 'text-emerald-400',
    label: 'Matriz diagonal dominante',
  },
  warn: {
    icon: AlertTriangle,
    wrapper: 'border-amber-500/20 bg-amber-500/10',
    badge: 'bg-amber-500 text-slate-950',
    title: 'text-amber-300',
    body: 'text-amber-100/80',
    accent: 'text-amber-400',
    label: 'Sin dominancia diagonal',
  },
  error: {
    icon: OctagonAlert,
    wrapper: 'border-rose-500/20 bg-rose-500/10',
    badge: 'bg-rose-500 text-slate-950',
    title: 'text-rose-300',
    body: 'text-rose-100/80',
    accent: 'text-rose-400',
    label: 'Diagonal con ceros',
  },
};

/**
 * Tarjeta de alerta con el resultado de `checkDiagonalDominance`,
 * incluyendo el detalle fila por fila del criterio |a_ii| > Σ|a_ij|.
 */
export default function DominanceCard({ diagnosis }) {
  if (!diagnosis) return null;

  const key = diagnosis.hasZeroDiagonal ? 'error' : diagnosis.isDominant ? 'ok' : 'warn';
  const style = STYLES[key];
  const Icon = style.icon;

  return (
    <section className={`animate-rise rounded-2xl border p-4 backdrop-blur-xl sm:p-5 ${style.wrapper}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.badge}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold ${style.title}`}>{style.label}</h3>
          <p className={`mt-1 text-sm leading-relaxed ${style.body}`}>{diagnosis.message}</p>

          <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
            {diagnosis.rows.map((row) => (
              <li
                key={row.index}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 font-mono text-xs tabular"
              >
                <span className={`font-sans font-semibold ${row.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                  F{row.index + 1}
                </span>
                <span className="text-slate-300">
                  {row.diagonal} {row.ok ? '>' : '≤'} {row.sum}
                </span>
                <span className={`ml-auto ${row.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {row.ok ? '✓' : '✕'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
