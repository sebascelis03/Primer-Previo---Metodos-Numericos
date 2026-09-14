import { BookOpen, MousePointerClick } from 'lucide-react';

const FORMULAS = [
  {
    name: 'Jacobi',
    accent: 'text-blue-700',
    border: 'border-blue-200 bg-blue-50/60',
    formula: 'xᵢ⁽ᵏ⁾ = ( bᵢ − Σ aᵢⱼ · xⱼ⁽ᵏ⁻¹⁾ ) / aᵢᵢ ,  j ≠ i',
    note: 'Usa únicamente los valores de la iteración anterior (desplazamientos simultáneos).',
  },
  {
    name: 'Gauss-Seidel',
    accent: 'text-emerald-700',
    border: 'border-emerald-200 bg-emerald-50/60',
    formula: 'xᵢ⁽ᵏ⁾ = ( bᵢ − Σ aᵢⱼ · xⱼ⁽ᵏ⁾ − Σ aᵢⱼ · xⱼ⁽ᵏ⁻¹⁾ ) / aᵢᵢ',
    note: 'Reutiliza de inmediato los valores recién calculados (desplazamientos sucesivos), por lo que suele converger más rápido.',
  },
];

/**
 * Estado inicial del panel de resultados: recordatorio teórico de los métodos
 * mientras el usuario no ha ejecutado ningún cálculo.
 */
export default function EmptyState() {
  return (
    <section className="card animate-fade p-6 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 grid size-14 place-items-center rounded-2xl bg-slate-900/5 text-slate-400">
          <MousePointerClick className="size-7" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-slate-900">Sin resultados todavía</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Complete la matriz del sistema y elija un método para ver la tabla de iteraciones, el error relativo
          porcentual y la solución aproximada.
        </p>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
        <BookOpen className="size-3.5" aria-hidden="true" />
        Fórmulas de iteración
      </div>

      <div className="grid gap-3">
        {FORMULAS.map((item) => (
          <div key={item.name} className={`rounded-xl border p-4 ${item.border}`}>
            <p className={`mb-2 text-sm font-bold ${item.accent}`}>{item.name}</p>
            <p className="overflow-x-auto font-mono text-xs whitespace-nowrap text-slate-800 sm:text-sm">
              {item.formula}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-sm font-bold text-slate-800">Criterio de parada</p>
        <p className="font-mono text-xs text-slate-700 sm:text-sm">
          εₐ = máx | (xᵢ⁽ᵏ⁾ − xᵢ⁽ᵏ⁻¹⁾) / xᵢ⁽ᵏ⁾ | × 100 % ≤ tolerancia
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          El proceso se detiene cuando el mayor error relativo porcentual entre las tres variables cae por debajo de la
          tolerancia indicada, o al alcanzar el máximo de iteraciones.
        </p>
      </div>
    </section>
  );
}
