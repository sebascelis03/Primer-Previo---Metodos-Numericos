import { useState } from 'react';
import { Dna, RefreshCw, Zap } from 'lucide-react';
import SequentialIterativeCalculator from './SequentialIterativeCalculator.jsx';
import NewtonRaphsonCalculator from './NewtonRaphsonCalculator.jsx';
import BairstowCalculator from './BairstowCalculator.jsx';

/** Métodos disponibles en el Segundo Previo, en orden pedagógico. */
const METHODS = [
  {
    id: 'fixed-point',
    label: 'Iterativo Secuencial',
    caption: 'Punto fijo x = g(x)',
    icon: RefreshCw,
    Calculator: SequentialIterativeCalculator,
  },
  {
    id: 'newton-raphson',
    label: 'Newton-Raphson',
    caption: 'Tangentes sucesivas',
    icon: Zap,
    Calculator: NewtonRaphsonCalculator,
  },
  {
    id: 'bairstow',
    label: 'Método de Bairstow',
    caption: 'Raíces reales y complejas',
    icon: Dna,
    Calculator: BairstowCalculator,
  },
];

/**
 * Vista del Segundo Previo: raíces de ecuaciones no lineales y polinomios.
 * Agrupa las tres calculadoras tras una barra de pestañas secundarias.
 */
export default function Previo2View() {
  const [activeMethod, setActiveMethod] = useState(METHODS[0].id);

  const active = METHODS.find((method) => method.id === activeMethod) ?? METHODS[0];
  const ActiveCalculator = active.Calculator;

  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- Pestañas de método ---------------- */}
      <nav
        aria-label="Método numérico"
        className="no-print card grid grid-cols-1 gap-1.5 p-1.5 sm:grid-cols-3"
      >
        {METHODS.map((method) => {
          const Icon = method.icon;
          const isActive = method.id === active.id;

          return (
            <button
              key={method.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActiveMethod(method.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{method.label}</span>
                <span className={`block truncate text-[11px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                  {method.caption}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* La clave fuerza el remontaje al cambiar de método, de modo que la
          animación de entrada se reproduzca en cada cambio de pestaña. */}
      <div key={active.id} className="animate-rise">
        <ActiveCalculator />
      </div>
    </div>
  );
}
