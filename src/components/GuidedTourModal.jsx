import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lightbulb, X } from 'lucide-react';

/**
 * Guiones de recorrido paso a paso según la calculadora activa.
 * Cada paso apunta opcionalmente a un selector `[data-tour="..."]` para
 * iluminar suavemente la sección correspondiente sin bloquear la vista.
 */
const TOUR_SCRIPTS = {
  'previo-1': {
    contextTitle: 'Guía rápida · Sistemas Lineales 3×3',
    steps: [
      {
        target: 'p1-matrix',
        title: '1. Matriz aumentada [A | b]',
        description:
          'Escribe aquí los coeficientes de las 3 ecuaciones y el vector independiente b. Las celdas en índigo son la diagonal principal (aᵢᵢ), que se usa como divisor para despejar x₁, x₂ y x₃.',
      },
      {
        target: 'p1-params',
        title: '2. Tolerancia y vector inicial x⁽⁰⁾',
        description:
          'Define el error relativo porcentual máximo permitido (por defecto 0.001 %) y el punto de arranque x⁽⁰⁾ = (0, 0, 0).',
      },
      {
        target: 'p1-actions',
        title: '3. Jacobi, Gauss-Seidel o Modo Duelo',
        description:
          'Resuelve con un método individual o pulsa "Modo Duelo" para enfrentar a Jacobi contra Gauss-Seidel y comparar cuántas iteraciones necesita cada uno.',
      },
      {
        target: 'p1-results',
        title: '4. Dominancia diagonal, despejes y paso a paso',
        description:
          'Aquí verás si la matriz es diagonal dominante (con botón para reordenar filas automáticamente y ver las fórmulas despejadas). Al calcular, haz clic en cualquier fila k de la tabla para ver el reemplazo numérico paso a paso.',
      },
    ],
  },
  'fixed-point': {
    contextTitle: 'Guía rápida · Iterativo Secuencial (Punto Fijo)',
    steps: [
      {
        target: 'p2-tabs',
        title: '1. Selector de método de Previo 2',
        description:
          'Estás en Iterativo Secuencial (Punto Fijo). Aquí puedes alternar en cualquier momento con Newton-Raphson o el Método de Bairstow.',
      },
      {
        target: 'p2-expression',
        title: '2. Ecuación interactiva g(x) estilo Photomath',
        description:
          'Ingresa la función despejada x = g(x). La pantalla superior muestra la ecuación en notación matemática real con casillas □ clicables donde puedes escribir directamente.',
      },
      {
        target: 'p2-keypad',
        title: '3. Teclado matemático visual y casillas □',
        description:
          'Usa las plantillas de raíces, fracciones, potencias o funciones a la izquierda y el teclado numérico a la derecha. Con el botón "Casilla □" (o la tecla Tab) saltas al siguiente hueco vacío.',
      },
      {
        target: 'p2-stop',
        title: '4. Valor inicial x₀ y criterio de parada',
        description:
          'Indica el valor inicial x₀ desde donde arrancará la sucesión x₍ₖ₊₁₎ = g(xₖ), junto con la tolerancia porcentual.',
      },
      {
        target: 'p2-results',
        title: '5. Raíz aproximada y desarrollo paso a paso',
        description:
          'En este panel verás la raíz x*, la comprobación g(x*) ≈ x* y la tabla completa. Si haces clic en cualquier fila k de la tabla, se abrirá la sustitución numérica explicada paso a paso.',
      },
    ],
  },
  'newton-raphson': {
    contextTitle: 'Guía rápida · Método de Newton-Raphson',
    steps: [
      {
        target: 'p2-expression',
        title: '1. Función f(x) = 0 en pantalla interactiva',
        description:
          'Escribe la función f(x) cuya raíz quieres encontrar usando el visor matemático 2D o el teclado visual con fracciones, raíces y exponentes.',
      },
      {
        target: 'nr-derivative',
        title: '2. Derivada automática o manual f′(x)',
        description:
          'Por defecto la calculadora aproxima f′(x) automáticamente por diferencias finitas centrales. Si tu profesor te pide usar la derivada analítica exacta, desactiva el interruptor para escribir f′(x).',
      },
      {
        target: 'p2-stop',
        title: '3. Punto inicial x₀ y tolerancia',
        description:
          'Elige el valor inicial x₀ desde donde se trazará la primera recta tangente y define el porcentaje de tolerancia.',
      },
      {
        target: 'p2-results',
        title: '4. Tabla de tangentes y explicación por fila',
        description:
          'Al calcular verás la raíz x*, el residual |f(x*)| y cada iteración. Haz clic sobre cualquier fila k para ver cómo se reemplazaron f(xₖ) y f′(xₖ) en la fórmula de Newton-Raphson.',
      },
    ],
  },
  bairstow: {
    contextTitle: 'Guía rápida · Método de Bairstow (Polinomios)',
    steps: [
      {
        target: 'bw-degree',
        title: '1. Grado del polinomio (n = 2 a 5)',
        description:
          'Selecciona el grado n de tu polinomio. La calculadora ajustará automáticamente las casillas desde xⁿ hasta el término independiente x⁰.',
      },
      {
        target: 'bw-coeffs',
        title: '2. Coeficientes y vista previa de P(x)',
        description:
          'Escribe cada coeficiente real aₙ … a₀. Debajo verás cómo se arma el polinomio P(x) en tiempo real.',
      },
      {
        target: 'bw-initial',
        title: '3. Valores iniciales r₀, s₀ y tolerancia',
        description:
          'Define las aproximaciones iniciales r₀ y s₀ del factor cuadrático x² − rx − s que dividirá al polinomio.',
      },
      {
        target: 'p2-results',
        title: '4. Raíces reales/complejas y doble división sintética',
        description:
          'Obtendrás todas las raíces (reales en cyan y complejas conjugadas a ± bi en violeta) y cada factor extraído. Haz clic en cualquier fila k para ver los arreglos b y c de la doble división sintética y el sistema 2×2.',
      },
    ],
  },
};

/**
 * Recorrido guiado paso a paso no invasivo.
 *
 * Ilumina con un borde ámbar suave la sección correspondiente de la pantalla
 * y presenta una ventana modal compacta en la esquina inferior derecha (o
 * centrada abajo en pantallas pequeñas) con botón de cerrar y botón para
 * avanzar al siguiente mensaje.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {'previo-1'|'fixed-point'|'newton-raphson'|'bairstow'} props.tourKey
 * @param {() => void} props.onClose
 */
export default function GuidedTourModal({ isOpen, tourKey, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const script = TOUR_SCRIPTS[tourKey] ?? TOUR_SCRIPTS['previo-1'];
  const steps = script.steps;
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  /** Reinicia al paso 0 cada vez que se abre el tour o se cambia de calculadora. */
  useEffect(() => {
    setStepIndex(0);
  }, [isOpen, tourKey]);

  /** Ilumina suavemente el elemento `[data-tour="..."]` del paso activo. */
  useEffect(() => {
    if (!isOpen || !currentStep?.target) return undefined;

    const element = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (!element) return undefined;

    element.classList.add('tour-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      element.classList.remove('tour-highlight');
    };
  }, [isOpen, currentStep]);

  /** Permite navegar con flechas o cerrar con Escape. */
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') {
        setStepIndex((i) => (i + 1 < steps.length ? i + 1 : i));
      } else if (event.key === 'ArrowLeft') {
        setStepIndex((i) => (i > 0 ? i - 1 : 0));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, steps.length, onClose]);

  if (!isOpen) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={script.contextTitle}
      className="no-print animate-rise fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md sm:right-6 sm:bottom-6 sm:left-auto"
    >
      <div className="rounded-2xl border border-amber-400/35 bg-slate-900/95 p-4 shadow-2xl shadow-slate-950/80 backdrop-blur-xl sm:p-5">
        {/* Cabecera: contexto + indicador de paso + botón cerrar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-amber-400/40 bg-amber-400/15 text-amber-300 shadow-sm shadow-amber-500/20">
              <Lightbulb className="size-4 fill-amber-300/30" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-amber-300/90 uppercase">
                {script.contextTitle}
              </p>
              <p className="text-[11px] text-slate-400">
                Paso {stepIndex + 1} de {steps.length}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Cerrar guía (Esc)"
            aria-label="Cerrar guía"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Barra de progreso por puntos */}
        <div className="mt-3 flex gap-1.5">
          {steps.map((item, idx) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setStepIndex(idx)}
              aria-label={`Ir al paso ${idx + 1}`}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx === stepIndex
                  ? 'bg-gradient-to-r from-amber-400 to-cyan-400'
                  : idx < stepIndex
                    ? 'bg-amber-400/40'
                    : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Contenido del paso */}
        <div className="mt-3.5">
          <h3 className="text-sm font-bold text-slate-100">{currentStep.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{currentStep.description}</p>
        </div>

        {/* Botones de navegación */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 transition hover:text-slate-200"
          >
            Saltar guía
          </button>

          <div className="flex items-center gap-2">
            {!isFirst ? (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-slate-100"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Anterior
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => {
                if (isLast) onClose();
                else setStepIndex((i) => i + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-300 active:scale-95"
            >
              {isLast ? (
                <>
                  <Check className="size-3.5" aria-hidden="true" />
                  Finalizar
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
