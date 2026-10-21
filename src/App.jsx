import { useEffect, useRef, useState } from 'react';
import { FunctionSquare, Grid3x3, Menu, X } from 'lucide-react';
import Previo1View from './components/previo1/Previo1View.jsx';
import Previo2View from './components/previo2/Previo2View.jsx';

/** Integrantes del equipo, mostrados en el menú del encabezado. */
const TEAM = [
  'Andres Esteban Sandoval Carreño',
  'Jhoan Sebastian Celis Pabon',
  'Zharick Nicoll Acevedo Ascanio',
];

/**
 * Los dos previos de la asignatura. Cada entrada define su propia
 * presentación del hero y la vista que se renderiza debajo.
 */
const PREVIOS = [
  {
    id: 'previo-1',
    tab: 'Previo 1',
    tabCaption: 'Sistemas lineales 3×3',
    menuCaption: 'Primer Previo',
    icon: Grid3x3,
    titleLead: 'Métodos Iterativos',
    titleAccent: '3×3',
    subtitle: 'Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel',
    View: Previo1View,
  },
  {
    id: 'previo-2',
    tab: 'Previo 2',
    tabCaption: 'Raíces no lineales',
    menuCaption: 'Segundo Previo',
    icon: FunctionSquare,
    titleLead: 'Ecuaciones No Lineales',
    titleAccent: 'y Polinomios',
    subtitle: 'Iterativo Secuencial, Newton-Raphson y Método de Bairstow',
    View: Previo2View,
  },
];

export default function App() {
  const [activePrevio, setActivePrevio] = useState(PREVIOS[0].id);
  const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
  const teamMenuRef = useRef(null);

  /** Cierra el menú del equipo al hacer clic fuera de él o al presionar Escape. */
  useEffect(() => {
    if (!isTeamMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!teamMenuRef.current?.contains(event.target)) setIsTeamMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsTeamMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTeamMenuOpen]);

  const previo = PREVIOS.find((item) => item.id === activePrevio) ?? PREVIOS[0];
  const PrevioIcon = previo.icon;
  const ActiveView = previo.View;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ---------------- Encabezado ---------------- */}
      <header className="relative mb-8 py-8 text-center sm:mb-10 sm:py-12">
        {/* Halo decorativo detrás del ícono: pura luz de fondo, nunca captura clics. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center">
          <div className="size-64 -translate-y-1/4 rounded-full bg-indigo-500 opacity-20 blur-3xl" />
        </div>

        {/* Menú del equipo: anclado a la esquina para no descentrar el hero.
            Se cierra con el propio botón, con Escape o al hacer clic fuera.
            El z-40 mantiene su dropdown por encima del thead sticky de las tablas. */}
        <div ref={teamMenuRef} className="no-print absolute top-4 right-0 z-40">
          <button
            type="button"
            onClick={() => setIsTeamMenuOpen((open) => !open)}
            aria-expanded={isTeamMenuOpen}
            aria-haspopup="menu"
            aria-label={isTeamMenuOpen ? 'Cerrar menú del equipo' : 'Abrir menú del equipo'}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10 hover:text-slate-100 active:scale-95"
          >
            {isTeamMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>

          {isTeamMenuOpen ? (
            <div
              role="menu"
              className="animate-fade absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-white/10 bg-slate-800/90 p-4 text-left shadow-2xl shadow-slate-950/60 backdrop-blur-xl"
            >
              <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Equipo</p>

              <ul className="space-y-2.5">
                {TEAM.map((member) => (
                  <li key={member} className="flex items-start gap-2.5 text-sm leading-snug text-slate-200">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                      aria-hidden="true"
                    />
                    {member}
                  </li>
                ))}
              </ul>

              <p className="mt-3.5 border-t border-white/10 pt-3 text-xs text-slate-500">
                Métodos Numéricos · {previo.menuCaption} · 2026-2
              </p>
            </div>
          ) : null}
        </div>

        {/* Contenido del hero, apilado y centrado sobre el halo. */}
        <div className="animate-rise relative z-10 flex flex-col items-center">
          <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white ring-2 shadow-lg ring-indigo-400/30 shadow-indigo-500/20 sm:size-20">
            <PrevioIcon className="size-8 sm:size-10" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-3xl leading-tight font-black text-balance sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {previo.titleLead}
            </span>{' '}
            <span className="text-cyan-400">{previo.titleAccent}</span>
          </h1>

          <p className="mt-2 max-w-lg text-base text-slate-400 text-balance sm:text-lg">{previo.subtitle}</p>

          {/* El tracking se reduce en móvil para que el chip no desborde
              pantallas estrechas (a 0.25em el texto supera los 360 px). */}
          <p className="mt-3 max-w-full rounded-full border border-white/10 px-3 py-1.5 text-[10px] tracking-[0.16em] text-slate-500 uppercase sm:px-4 sm:text-xs sm:tracking-[0.25em]">
            FESC · Ingeniería de Software · 2026-2
          </p>

          {/* Selector de previo: control segmentado centrado bajo el hero. */}
          <nav
            aria-label="Previo"
            className="no-print mt-6 grid w-full max-w-md grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl"
          >
            {PREVIOS.map((item) => {
              const isActive = item.id === previo.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActivePrevio(item.id)}
                  className={`rounded-xl px-3 py-2 transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-sm font-bold">{item.tab}</span>
                  <span className={`block truncate text-[11px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {item.tabCaption}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Separador que cierra el hero y lo despega del contenido. */}
        <div
          aria-hidden="true"
          className="relative z-10 mt-8 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"
        />
      </header>

      {/* ---------------- Vista activa ---------------- */}
      <ActiveView />

      <footer className="no-print mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
        <p>
          Métodos Numéricos · Resultados redondeados a 6 cifras decimales · Aplicación instalable que funciona sin
          conexión
        </p>
      </footer>
    </div>
  );
}
