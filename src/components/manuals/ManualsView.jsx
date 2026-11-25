import { useState } from 'react';
import { ArrowLeft, BookOpen, Cpu, ListFilter } from 'lucide-react';
import UserManualContent, { USER_MANUAL_SECTIONS } from './UserManualContent.jsx';
import TechnicalManualContent, { TECHNICAL_MANUAL_SECTIONS } from './TechnicalManualContent.jsx';

/**
 * Los dos manuales disponibles en la vista de documentación.
 * El selector replica exactamente el estilo de pestañas de Previo2View.jsx.
 */
const MANUALS = [
  {
    id: 'user-manual',
    label: 'Manual de Usuario',
    caption: 'Uso paso a paso de Previo 1, Previo 2 y teclado Photomath',
    icon: BookOpen,
    sections: USER_MANUAL_SECTIONS,
    Content: UserManualContent,
  },
  {
    id: 'technical-manual',
    label: 'Manual Técnico',
    caption: 'Arquitectura, parser AST sin eval y algoritmos numéricos',
    icon: Cpu,
    sections: TECHNICAL_MANUAL_SECTIONS,
    Content: TechnicalManualContent,
  },
];

/**
 * Vista dedicada de Documentación del Sistema (Manual de Usuario y Manual Técnico).
 *
 * @param {object} props
 * @param {() => void} props.onBack regresa a la vista de calculadoras
 */
export default function ManualsView({ onBack }) {
  const [activeManual, setActiveManual] = useState(MANUALS[0].id);

  const active = MANUALS.find((item) => item.id === activeManual) ?? MANUALS[0];
  const ActiveContent = active.Content;

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="animate-rise flex flex-col gap-6">
      {/* Barra superior con botón para regresar a las calculadoras + Selector estilo Previo 2 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white active:scale-95"
        >
          <ArrowLeft className="size-4 text-indigo-400" aria-hidden="true" />
          Volver a las calculadoras
        </button>

        <p className="text-xs text-slate-400">
          Documentación oficial del proyecto · <span className="font-semibold text-slate-300">FESC 2026-2</span>
        </p>
      </div>

      {/* ---------------- Pestañas de Manual (mismo diseño que Previo2View) ---------------- */}
      <nav
        aria-label="Seleccionar manual"
        className="no-print card grid grid-cols-1 gap-1.5 p-1.5 sm:grid-cols-2"
      >
        {MANUALS.map((manual) => {
          const Icon = manual.icon;
          const isActive = manual.id === active.id;

          return (
            <button
              key={manual.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => setActiveManual(manual.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{manual.label}</span>
                <span className={`block truncate text-xs ${isActive ? 'text-white/85' : 'text-slate-500'}`}>
                  {manual.caption}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Layout de escritorio: Índice lateral fijo a la izquierda + Contenido detallado a la derecha */}
      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="card no-print p-4 lg:sticky lg:top-6">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <ListFilter className="size-3.5 text-indigo-400" aria-hidden="true" />
            Contenido del manual
          </p>
          <ul className="space-y-1">
            {active.sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div key={active.id} className="animate-rise min-w-0">
          <ActiveContent />
        </div>
      </div>
    </div>
  );
}
