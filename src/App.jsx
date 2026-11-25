import { useEffect, useRef, useState } from 'react';
import { BookOpen, Lightbulb, Menu, X } from 'lucide-react';
import Previo1View from './components/previo1/Previo1View.jsx';
import Previo2View from './components/previo2/Previo2View.jsx';
import GuidedTourModal from './components/GuidedTourModal.jsx';
import ManualsView from './components/manuals/ManualsView.jsx';

/** Integrantes del equipo, mostrados en el menú del encabezado. */
const TEAM = [
  'Andres Esteban Sandoval Carreño',
  'Jhoan Sebastian Celis Pabon',
  'Zharick Nicoll Acevedo Ascanio',
];

/**
 * Los dos previos de la asignatura. Cada entrada define su título
 * y la vista que se renderiza debajo.
 */
const PREVIOS = [
  {
    id: 'previo-1',
    tab: 'Previo 1',
    tabCaption: 'Sistemas lineales 3×3',
    menuCaption: 'Primer Previo',
    title: 'Métodos Iterativos 3×3',
    subtitle: 'Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel',
  },
  {
    id: 'previo-2',
    tab: 'Previo 2',
    tabCaption: 'Raíces no lineales',
    menuCaption: 'Segundo Previo',
    title: 'Ecuaciones No Lineales y Polinomios',
    subtitle: 'Iterativo Secuencial, Newton-Raphson y Método de Bairstow',
  },
];

export default function App() {
  const [activePrevio, setActivePrevio] = useState(PREVIOS[0].id);
  const [previo2Method, setPrevio2Method] = useState('fixed-point');
  const [isManualsOpen, setIsManualsOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
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
  const activeTourKey = previo.id === 'previo-1' ? 'previo-1' : previo2Method;

  const handleSelectPrevio = (previoId) => {
    setActivePrevio(previoId);
    setIsManualsOpen(false);
  };

  const handleToggleManuals = () => {
    setIsManualsOpen((open) => {
      const next = !open;
      if (next) setIsTourOpen(false);
      return next;
    });
  };

  /** Permite saltar desde cualquier sección del Manual de Usuario directo a la calculadora explicada. */
  const handleLaunchCalculator = (target) => {
    if (target === 'previo-1') {
      setActivePrevio('previo-1');
    } else {
      setActivePrevio('previo-2');
      setPrevio2Method(target);
    }
    setIsManualsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto min-h-dvh w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      {/* ---------------- Encabezado limpio con Previos centrados ---------------- */}
      <header className="relative z-30 mb-6 border-b border-white/10 pb-4">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Izquierda: Tipografía limpia */}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Métodos Numéricos · FESC 2026-2
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-100 sm:text-[26px]">
              {isManualsOpen ? 'Manuales del Sistema' : previo.title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              {isManualsOpen
                ? 'Manual de Usuario paso a paso y Manual Técnico de arquitectura y algoritmos'
                : previo.subtitle}
            </p>
          </div>

          {/* Centro: Selector de Previo centrado */}
          <nav
            aria-label="Previo"
            className="no-print mx-auto grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 sm:w-72"
          >
            {PREVIOS.map((item) => {
              const isActive = !isManualsOpen && item.id === previo.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleSelectPrevio(item.id)}
                  className={`rounded-lg px-3 py-1.5 text-center transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow shadow-indigo-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-bold leading-tight">{item.tab}</span>
                  <span className={`block truncate text-[10px] ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                    {item.tabCaption}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Derecha: Botón Libro (Manuales) + Botón Bombillo (Guía paso a paso) + Menú Hamburguesa */}
          <div className="no-print flex items-center justify-end gap-2 lg:justify-self-end">
            <button
              type="button"
              onClick={handleToggleManuals}
              aria-pressed={isManualsOpen}
              title={isManualsOpen ? 'Volver a las calculadoras' : 'Abrir Manual de Usuario y Manual Técnico'}
              aria-label="Abrir Manual de Usuario y Manual Técnico"
              className={`grid size-10 place-items-center rounded-xl border transition active:scale-95 ${
                isManualsOpen
                  ? 'border-indigo-400/60 bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/25'
                  : 'border-indigo-400/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-400/50 hover:bg-indigo-500/20'
              }`}
            >
              <BookOpen className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (isManualsOpen) setIsManualsOpen(false);
                setIsTourOpen((open) => !open);
              }}
              aria-pressed={isTourOpen}
              title="Recorrido guiado paso a paso de esta calculadora"
              aria-label="Iniciar recorrido guiado paso a paso"
              className={`grid size-10 place-items-center rounded-xl border transition active:scale-95 ${
                isTourOpen
                  ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-500/20'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300 hover:border-amber-400/50 hover:bg-amber-400/20'
              }`}
            >
              <Lightbulb className="size-4 fill-amber-300/35" aria-hidden="true" />
            </button>

            <div ref={teamMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsTeamMenuOpen((open) => !open)}
                aria-expanded={isTeamMenuOpen}
                aria-haspopup="menu"
                aria-label={isTeamMenuOpen ? 'Cerrar menú del equipo' : 'Abrir menú del equipo'}
                className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-slate-100 active:scale-95"
              >
                {isTeamMenuOpen ? (
                  <X className="size-4" aria-hidden="true" />
                ) : (
                  <Menu className="size-4" aria-hidden="true" />
                )}
              </button>

              {isTeamMenuOpen ? (
                <div
                  role="menu"
                  className="animate-fade absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-white/10 bg-slate-800/95 p-4 text-left shadow-2xl shadow-slate-950/70 backdrop-blur-xl"
                >
                  <p className="mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">Equipo</p>

                  <ul className="space-y-2.5">
                    {TEAM.map((member) => (
                      <li key={member} className="flex items-start gap-2.5 text-sm leading-snug text-slate-200">
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400"
                          aria-hidden="true"
                        />
                        {member}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3.5 border-t border-white/10 pt-3 text-xs text-slate-500">
                    Ingeniería de Software · {previo.menuCaption} · 2026-2
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- Vista activa (Manuales o Calculadoras) ---------------- */}
      {isManualsOpen ? (
        <ManualsView
          onBack={() => setIsManualsOpen(false)}
          onLaunchCalculator={handleLaunchCalculator}
        />
      ) : previo.id === 'previo-1' ? (
        <Previo1View />
      ) : (
        <Previo2View activeMethod={previo2Method} onMethodChange={setPrevio2Method} />
      )}

      {/* ---------------- Recorrido Guiado Contextual (Bombillo) ---------------- */}
      <GuidedTourModal isOpen={isTourOpen} tourKey={activeTourKey} onClose={() => setIsTourOpen(false)} />

      <footer className="no-print mt-8 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
        <p>
          Métodos Numéricos · Resultados redondeados a 6 cifras decimales · Aplicación instalable que funciona sin
          conexión
        </p>
      </footer>
    </div>
  );
}
