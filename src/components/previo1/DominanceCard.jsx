import { useState } from 'react';
import { AlertTriangle, ArrowUpDown, BookOpen, CheckCircle2, ChevronDown, OctagonAlert } from 'lucide-react';

/**
 * Paleta por estado del diagnóstico de dominancia diagonal.
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

const SUB = ['₁', '₂', '₃'];

/**
 * Construye la representación legible de cada ecuación original y su despeje
 * explícito para que el estudiante vea cómo se arma cada iteración.
 * @param {number[][]} A
 * @param {number[]} b
 */
function buildClearedFormulas(A, b) {
  if (!Array.isArray(A) || !Array.isArray(b)) return [];

  return [0, 1, 2].map((i) => {
    const aii = A[i][i];
    const bi = b[i];
    const others = [0, 1, 2].filter((j) => j !== i);

    const rhsTerms = others.map((j) => {
      const coef = A[i][j];
      const sign = coef >= 0 ? '−' : '+';
      return `${sign} ${Math.abs(coef)}·x${SUB[j]}`;
    });

    const numerator = `${bi} ${rhsTerms.join(' ')}`;
    return {
      variable: `x${SUB[i]}`,
      diagonal: aii,
      formula: aii === 0 ? `No se puede despejar (a${i + 1}${i + 1} = 0)` : `(${numerator}) / ${aii}`,
    };
  });
}

/**
 * Tarjeta de diagnóstico de dominancia diagonal con:
 * - Detalle fila por fila |a_ii| > Σ|a_ij|.
 * - Botón de reordenamiento automático de filas cuando la matriz puede mejorarse.
 * - Desplegable pedagógico con las 3 fórmulas despejadas del sistema actual.
 */
export default function DominanceCard({ diagnosis, matrixNum, vectorNum, suggestion, onApplyPermutation }) {
  const [showFormulas, setShowFormulas] = useState(false);

  if (!diagnosis) return null;

  const key = diagnosis.hasZeroDiagonal ? 'error' : diagnosis.isDominant ? 'ok' : 'warn';
  const style = STYLES[key];
  const Icon = style.icon;
  const clearedFormulas = buildClearedFormulas(matrixNum, vectorNum);

  return (
    <section className={`animate-rise rounded-2xl border p-4 backdrop-blur-xl sm:p-5 ${style.wrapper}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.badge}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={`text-sm font-bold ${style.title}`}>{style.label}</h3>

            {clearedFormulas.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowFormulas((open) => !open)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950/30 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-950/50"
              >
                <BookOpen className="size-3.5 text-indigo-300" aria-hidden="true" />
                {showFormulas ? 'Ocultar despejes' : 'Ver fórmulas despejadas'}
                <ChevronDown
                  className={`size-3.5 transition-transform ${showFormulas ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>

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
                  |{row.diagonal}| {row.ok ? '>' : '≤'} {row.sum}
                </span>
                <span className={`ml-auto ${row.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {row.ok ? '✓' : '✕'}
                </span>
              </li>
            ))}
          </ul>

          {/* Botón de reordenamiento automático si existe una permutación mejor */}
          {suggestion?.canImprove && onApplyPermutation ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => onApplyPermutation(suggestion.order)}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/15 px-3.5 py-2 text-xs font-bold text-amber-200 transition hover:bg-amber-400/25 active:scale-95"
              >
                <ArrowUpDown className="size-3.5" aria-hidden="true" />
                {suggestion.label}
              </button>
            </div>
          ) : null}

          {/* Desplegable con las 3 ecuaciones despejadas del sistema */}
          {showFormulas ? (
            <div className="animate-fade mt-3.5 rounded-xl border border-white/10 bg-slate-950/50 p-3.5">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                Fórmulas de despeje para iterar (xᵢ = (bᵢ − Σ aᵢⱼ·xⱼ) / aᵢᵢ)
              </p>
              <div className="grid gap-1.5 font-mono text-xs text-slate-200">
                {clearedFormulas.map((item) => (
                  <div
                    key={item.variable}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5"
                  >
                    <span className="font-bold text-indigo-300">{item.variable} =</span>
                    <span>{item.formula}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
