import { Crown, Gauge, Minus, Swords, Trophy, XCircle } from 'lucide-react';
import { DECIMALS } from '../utils/numericalMethods.js';

const fmt = (value) => (Number.isFinite(value) ? value.toFixed(DECIMALS) : '∞');

/**
 * Decide el ganador del duelo.
 * 1. Converger vale más que ser rápido: si solo uno converge, gana.
 * 2. Si ambos convergen, gana el que necesite menos iteraciones.
 * 3. Empate si coinciden o si ninguno de los dos converge.
 */
function decideWinner(jacobi, gaussSeidel) {
  const a = jacobi.summary;
  const b = gaussSeidel.summary;

  if (a.converged && !b.converged) return 'jacobi';
  if (b.converged && !a.converged) return 'gauss-seidel';
  if (!a.converged && !b.converged) return 'none';
  if (a.iterations < b.iterations) return 'jacobi';
  if (b.iterations < a.iterations) return 'gauss-seidel';
  return 'tie';
}

function StatColumn({ name, summary, accent, isWinner }) {
  const palette =
    accent === 'blue'
      ? { bar: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-400', soft: 'bg-blue-50' }
      : { bar: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-400', soft: 'bg-emerald-50' };

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 p-4 transition ${
        isWinner ? `${palette.soft} ring-2 ${palette.ring}` : 'bg-white'
      }`}
    >
      {isWinner ? (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
          <Crown className="size-3" aria-hidden="true" />
          Ganador
        </span>
      ) : null}

      <p className={`mb-3 text-center text-sm font-bold ${palette.text}`}>{name}</p>

      <p className="text-center font-mono text-4xl font-black text-slate-900 tabular">{summary.iterations}</p>
      <p className="mb-3 text-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase">iteraciones</p>

      <dl className="space-y-1.5 border-t border-slate-200/80 pt-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500">Estado</dt>
          <dd className={`font-semibold ${summary.converged ? 'text-emerald-600' : 'text-amber-600'}`}>
            {summary.converged ? 'Convergió' : summary.status === 'diverged' ? 'Divergió' : 'Sin converger'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-slate-500">Error final</dt>
          <dd className="font-mono font-semibold text-slate-800 tabular">
            {Number.isFinite(summary.finalError) ? `${summary.finalError}%` : '∞'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="shrink-0 text-slate-500">Solución</dt>
          <dd className="text-right font-mono text-[11px] leading-tight text-slate-700 tabular">
            {summary.solution.map((value, i) => (
              <span key={i} className="block">
                {fmt(value)}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Resumen visual del "Modo Duelo": compara Jacobi contra Gauss-Seidel
 * ejecutados con exactamente los mismos datos de entrada.
 */
export default function DuelCard({ jacobi, gaussSeidel, tolerance }) {
  const winner = decideWinner(jacobi, gaussSeidel);

  const jIters = jacobi.summary.iterations;
  const gIters = gaussSeidel.summary.iterations;
  const maxIters = Math.max(jIters, gIters, 1);

  const winnerName = winner === 'jacobi' ? 'Jacobi' : 'Gauss-Seidel';
  const loserSummary = winner === 'jacobi' ? gaussSeidel.summary : jacobi.summary;
  const winnerSummary = winner === 'jacobi' ? jacobi.summary : gaussSeidel.summary;
  const loserName = winner === 'jacobi' ? 'Gauss-Seidel' : 'Jacobi';

  const saved = Math.abs(jIters - gIters);
  const speedup =
    winner === 'jacobi' || winner === 'gauss-seidel'
      ? Math.round((saved / Math.max(loserSummary.iterations, 1)) * 100)
      : 0;

  let verdict;
  let VerdictIcon = Trophy;
  if (winner === 'none') {
    VerdictIcon = XCircle;
    verdict = `Ninguno de los dos métodos alcanzó la tolerancia de ${tolerance}%. Verifique la dominancia diagonal de la matriz o aumente el máximo de iteraciones.`;
  } else if (winner === 'tie') {
    VerdictIcon = Minus;
    verdict = `Empate técnico: ambos métodos convergieron en ${jIters} iteraciones para una tolerancia de ${tolerance}%.`;
  } else if (loserSummary.converged) {
    verdict = `${winnerName} convergió en ${winnerSummary.iterations} iteraciones, mientras que ${loserName} tomó ${loserSummary.iterations} iteraciones para la misma tolerancia (${tolerance}%). Eso es ${saved} ${
      saved === 1 ? 'iteración' : 'iteraciones'
    } menos, un ${speedup}% más rápido.`;
  } else {
    verdict = `${winnerName} convergió en ${winnerSummary.iterations} iteraciones con una tolerancia de ${tolerance}%, mientras que ${loserName} ${
      loserSummary.status === 'diverged' ? 'divergió' : 'no alcanzó la tolerancia dentro del límite de iteraciones'
    }.`;
  }

  return (
    <section className="card animate-rise overflow-hidden">
      <header className="flex items-center gap-3 bg-slate-900 px-4 py-3.5 sm:px-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-amber-300">
          <Swords className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-bold text-white">Modo Duelo</h3>
          <p className="text-xs text-white/70">Jacobi vs. Gauss-Seidel con datos idénticos</p>
        </div>
      </header>

      <div className="p-4 sm:p-5">
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <StatColumn name="Jacobi" summary={jacobi.summary} accent="blue" isWinner={winner === 'jacobi'} />
          <StatColumn
            name="Gauss-Seidel"
            summary={gaussSeidel.summary}
            accent="emerald"
            isWinner={winner === 'gauss-seidel'}
          />
        </div>

        {/* Comparativa visual de iteraciones */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <Gauge className="size-3.5" aria-hidden="true" />
            Iteraciones requeridas
          </div>

          {[
            { label: 'Jacobi', value: jIters, bar: 'bg-blue-500' },
            { label: 'Gauss-Seidel', value: gIters, bar: 'bg-emerald-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs font-medium text-slate-600">{item.label}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.bar}`}
                  style={{ width: `${Math.max((item.value / maxIters) * 100, 4)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-xs font-bold text-slate-700 tabular">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Veredicto */}
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border p-3.5 ${
            winner === 'none' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <VerdictIcon
            className={`mt-0.5 size-5 shrink-0 ${winner === 'none' ? 'text-amber-500' : 'text-amber-500'}`}
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-slate-700">{verdict}</p>
        </div>
      </div>
    </section>
  );
}
