import {
  AlertTriangle,
  ArrowRight,
  ArrowRightToLine,
  ArrowUpDown,
  BookOpen,
  Calculator,
  CheckCircle2,
  Dna,
  FlaskConical,
  FunctionSquare,
  Keyboard,
  Lightbulb,
  MousePointerClick,
  RefreshCw,
  Swords,
  Zap,
} from 'lucide-react';
import MathPreview from '../previo2/MathPreview.jsx';

/** Secciones del Manual de Usuario para el índice de navegación lateral. */
export const USER_MANUAL_SECTIONS = [
  { id: 'um-intro', label: '1. Introducción y Navegación' },
  { id: 'um-previo1', label: '2. Previo 1: Sistemas 3×3' },
  { id: 'um-editor', label: '3. Editor y Teclado Photomath' },
  { id: 'um-catalogo', label: '4. Catálogo de Funciones 2D' },
  { id: 'um-previo2', label: '5. Previo 2: Las 3 Calculadoras' },
  { id: 'um-aprendizaje', label: '6. Modo Aprendizaje Paso a Paso' },
  { id: 'um-casos', label: '7. Casos de Prueba y Solución de Errores' },
];

/** Catálogo completo de funciones y constantes aceptadas por el editor. */
const FUNCTION_CATALOG = [
  { syntax: '(a)/(b)', preview: '(x + 1)/(2x - 3)', category: 'Álgebra', domain: 'Denominador ≠ 0' },
  { syntax: 'x^n', preview: 'x^3 - 2x^2', category: 'Potencia', domain: 'ℝ (si n es entero)' },
  { syntax: 'sqrt(x)', preview: 'sqrt(x + 5)', category: 'Raíz cuadrada', domain: 'Radicando ≥ 0' },
  { syntax: 'cbrt(x)', preview: 'cbrt(x - 8)', category: 'Raíz cúbica', domain: 'Todo número real ℝ' },
  { syntax: 'nroot(x, n)', preview: 'nroot(x + 1, 4)', category: 'Raíz n-ésima', domain: 'ℝ si n impar; x ≥ 0 si n par' },
  { syntax: 'abs(x)', preview: 'abs(x - 2)', category: 'Valor absoluto', domain: 'Todo número real ℝ' },
  { syntax: 'exp(x)', preview: 'exp(-x)', category: 'Exponencial natural', domain: 'Todo número real ℝ' },
  { syntax: 'ln(x)', preview: 'ln(x)', category: 'Logaritmo natural', domain: 'Argumento > 0' },
  { syntax: 'log10(x)', preview: 'log10(x)', category: 'Logaritmo base 10', domain: 'Argumento > 0' },
  { syntax: 'sin(x) · cos(x) · tan(x)', preview: 'sin(x) + cos(x)', category: 'Trigonométricas (rad)', domain: 'Ángulo en radianes' },
  { syntax: 'asin(x) · acos(x) · atan(x)', preview: 'asin(x)', category: 'Trigonométricas inversas', domain: '[-1, 1] para asin y acos' },
  { syntax: 'sinh(x) · cosh(x) · tanh(x)', preview: 'cosh(x)', category: 'Hiperbólicas', domain: 'Todo número real ℝ' },
  { syntax: 'pi · e', preview: 'pi * x + e', category: 'Constantes exactas', domain: 'π ≈ 3.141593 · e ≈ 2.718282' },
];

/**
 * Contenido detallado del Manual de Usuario para estudiantes y docentes.
 *
 * @param {object} props
 * @param {(target:'previo-1'|'fixed-point'|'newton-raphson'|'bairstow') => void} [props.onLaunchCalculator]
 */
export default function UserManualContent({ onLaunchCalculator }) {
  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- 1. Introducción y Navegación ---------------- */}
      <section id="um-intro" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <BookOpen className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 1</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">Introducción y Navegación General</h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          Esta plataforma interactiva fue diseñada para la asignatura de <strong className="text-white">Métodos Numéricos</strong>{' '}
          (Ingeniería de Software · FESC 2026-2). Su propósito es permitir que el estudiante resuelva problemas numéricos
          con <strong className="text-cyan-300">precisión de 6 cifras decimales</strong> y comprenda de dónde sale cada
          número mediante fórmulas despejadas y sustituciones paso a paso.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs font-bold text-indigo-300">Selector Central (Previo 1 / Previo 2)</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Ubicado en el centro del encabezado superior. Permite alternar con un clic entre{' '}
              <strong className="text-slate-200">Previo 1</strong> (Sistemas de ecuaciones lineales 3×3) y{' '}
              <strong className="text-slate-200">Previo 2</strong> (Ecuaciones no lineales y raíces de polinomios).
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Lightbulb className="size-3.5" aria-hidden="true" />
              Botón de Bombillo (Recorrido Guiado)
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Al pulsarlo, lanza una guía interactiva paso a paso adaptada exactamente a la calculadora que tengas
              abierta, iluminando cada sección con una ventana flotante no invasiva.
            </p>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
            <p className="text-xs font-bold text-cyan-300">100 % Local y Sin Conexión (PWA)</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Todos los cálculos se ejecutan directamente en tu computador. Puedes instalar la aplicación desde el
              navegador y usarla sin conexión a internet.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 2. Previo 1: Sistemas Lineales 3×3 ---------------- */}
      <section id="um-previo1" className="card p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
              <Calculator className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 2</p>
              <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
                Previo 1: Sistemas de Ecuaciones Lineales 3×3 (Jacobi y Gauss-Seidel)
              </h2>
            </div>
          </div>

          {onLaunchCalculator ? (
            <button
              type="button"
              onClick={() => onLaunchCalculator('previo-1')}
              className="no-print inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/25 active:scale-95"
            >
              Ir a Previo 1
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          Este módulo resuelve sistemas matriciales de la forma <span className="font-mono text-indigo-300">A · x = b</span>{' '}
          con tres incógnitas (<span className="font-mono">x₁, x₂, x₃</span>) mediante métodos iterativos.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-slate-100">Paso 1: Ingresar la Matriz Aumentada [A | b]</h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
              <li>
                • <strong className="text-indigo-300">Matriz A (3×3):</strong> Escribe los coeficientes que acompañan a{' '}
                <span className="font-mono">x₁, x₂, x₃</span> en cada fila. Las celdas resaltadas en índigo corresponden
                a la <strong className="text-white">diagonal principal (a₁₁, a₂₂, a₃₃)</strong>, donde se despeja cada
                variable.
              </li>
              <li>
                • <strong className="text-cyan-300">Vector b (3×1):</strong> Escribe los términos independientes a la
                derecha de la igualdad.
              </li>
              <li>
                • <strong className="text-slate-100">Parámetros de parada:</strong> Configura la{' '}
                <span className="font-mono">Tolerancia (% error)</span> (por defecto <span className="font-mono">0.001%</span>),
                el máximo de iteraciones (<span className="font-mono">50</span>) y el vector inicial{' '}
                <span className="font-mono">x⁽⁰⁾ = (0, 0, 0)</span>.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-slate-100">
              Paso 2: Diagnóstico de Dominancia Diagonal y Despejes
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Mientras editas la matriz, la tarjeta superior verifica automáticamente si en cada fila se cumple{' '}
              <span className="font-mono text-emerald-300">|aᵢᵢ| &gt; Σ |aᵢⱼ|</span>:
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>
                  <strong className="text-emerald-300">Verde (Dominante):</strong> La convergencia de Jacobi y
                  Gauss-Seidel está garantizada.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowUpDown className="mt-0.5 size-3.5 shrink-0 text-amber-400" aria-hidden="true" />
                <span>
                  <strong className="text-amber-300">Botón "Reordenar filas automáticamente":</strong> Si la matriz no es
                  dominante o tiene un cero en la diagonal, aparece este botón para permutar las ecuaciones con un solo
                  clic.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="mt-0.5 size-3.5 shrink-0 text-indigo-400" aria-hidden="true" />
                <span>
                  <strong className="text-indigo-300">Botón "Ver fórmulas despejadas":</strong> Despliega las 3
                  ecuaciones despejadas (<span className="font-mono">x₁ = …, x₂ = …, x₃ = …</span>) listas para copiar
                  al cuaderno.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Swords className="size-4 text-cyan-400" aria-hidden="true" />
            Paso 3: Jacobi vs. Gauss-Seidel y Modo Duelo
          </h3>
          <div className="mt-2.5 grid gap-3 text-xs leading-relaxed text-slate-300 sm:grid-cols-3">
            <div>
              <p className="font-bold text-indigo-300">Resolver por Jacobi</p>
              <p className="mt-1 text-slate-400">
                Calcula <span className="font-mono">x₁⁽ᵏ⁾, x₂⁽ᵏ⁾, x₃⁽ᵏ⁾</span> usando exclusivamente los valores de la
                iteración anterior <span className="font-mono">(k − 1)</span>.
              </p>
            </div>
            <div>
              <p className="font-bold text-cyan-300">Resolver por Gauss-Seidel</p>
              <p className="mt-1 text-slate-400">
                Usa de inmediato el nuevo <span className="font-mono">x₁⁽ᵏ⁾</span> para calcular{' '}
                <span className="font-mono">x₂⁽ᵏ⁾</span>, y ambos para calcular <span className="font-mono">x₃⁽ᵏ⁾</span>,
                acelerando la convergencia.
              </p>
            </div>
            <div>
              <p className="font-bold text-emerald-300">Modo Duelo + Residual</p>
              <p className="mt-1 text-slate-400">
                Ejecuta ambos métodos en paralelo, corona al más rápido y comprueba la solución con el vector residual{' '}
                <span className="font-mono">r = b − A·x</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. Editor y Teclado Matemático Photomath ---------------- */}
      <section id="um-editor" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
            <Keyboard className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-cyan-300 uppercase">Sección 3</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Editor Matemático Interactivo y Teclado Visual Estilo Photomath
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          En <strong className="text-white">Previo 2</strong> no necesitas memorizar sintaxis complicada de programación.
          Las funciones <span className="font-mono">g(x)</span>, <span className="font-mono">f(x)</span> y{' '}
          <span className="font-mono">f′(x)</span> cuentan con una <strong className="text-cyan-300">pantalla matemática 2D en vivo</strong>{' '}
          sincronizada con un teclado visual de doble panel.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Fracciones Apiladas</p>
            <div className="flex justify-center text-slate-100">
              <MathPreview expression="(exp(-x) + x)/2" compact />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Raíces Cuadradas, Cúbicas y n-ésimas
            </p>
            <div className="flex justify-center text-slate-100">
              <MathPreview expression="nroot(x + 5, 3)" compact />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3.5 text-center">
            <p className="mb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Funciones y Casillas Vacías □
            </p>
            <div className="flex justify-center text-slate-100">
              <MathPreview expression="ln() + x^()" compact />
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-2.5">Elemento / Botón</th>
                <th className="px-4 py-2.5">Qué inserta</th>
                <th className="px-4 py-2.5">Cómo funciona para el usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-cyan-300">Casillas interactivas □</td>
                <td className="px-4 py-2.5 font-mono text-amber-300">( ) · huecos por llenar</td>
                <td className="px-4 py-2.5">
                  La casilla activa brilla en cyan. Puedes hacer clic con el mouse directamente sobre cualquier casilla{' '}
                  <span className="font-mono">□</span> de la ecuación 2D para escribir dentro de ella.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-amber-200">
                  <span className="inline-flex items-center gap-1">
                    <ArrowRightToLine className="size-3.5" /> Casilla □ (o tecla Tab)
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-400">Salto de cursor</td>
                <td className="px-4 py-2.5">
                  Salta automáticamente del numerador al denominador, o del radicando al índice de una raíz n-ésima.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Fracción □/□ · Potencias x², x³, x^□</td>
                <td className="px-4 py-2.5 font-mono">()/() · ^2 · ^3 · ^()</td>
                <td className="px-4 py-2.5">
                  Si seleccionas primero una expresión (ej. <span className="font-mono">x+1</span>) y pulsas fracción, la
                  convierte automáticamente en el numerador <span className="font-mono">(x+1)/()</span>.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Raíces √□, ∛□, ⁿ√□</td>
                <td className="px-4 py-2.5 font-mono">sqrt() · cbrt() · nroot(, )</td>
                <td className="px-4 py-2.5">
                  Dibuja el radical con barra superior. En <span className="font-mono">nroot(x, n)</span> el primer hueco
                  es el radicando y el segundo es el índice de la raíz.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Borrar inteligente ⌫</td>
                <td className="px-4 py-2.5 font-mono text-slate-400">Retroceso</td>
                <td className="px-4 py-2.5">
                  Si el cursor está dentro de una función vacía como <span className="font-mono">sqrt()</span> o{' '}
                  <span className="font-mono">sin()</span>, un solo toque elimina toda la función vacía de golpe.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 4. Catálogo Completo de Funciones y Notación 2D ---------------- */}
      <section id="um-catalogo" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <FunctionSquare className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 4</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Catálogo Completo de Funciones, Constantes y Dominios Matemáticos
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          Referencia rápida de todas las expresiones reconocidas por el motor matemático, cómo se escriben por teclado y
          cómo las dibuja la pantalla interactiva 2D. Recuerda que también se admite <strong className="text-white">multiplicación implícita</strong>{' '}
          (<span className="font-mono text-cyan-300">2x</span>, <span className="font-mono text-cyan-300">3(x+1)</span>,{' '}
          <span className="font-mono text-cyan-300">pi x</span>).
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-2.5">Categoría</th>
                <th className="px-4 py-2.5">Sintaxis de texto</th>
                <th className="px-4 py-2.5">Vista 2D en pantalla</th>
                <th className="px-4 py-2.5">Dominio / Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
              {FUNCTION_CATALOG.map((item) => (
                <tr key={item.syntax}>
                  <td className="px-4 py-2 font-semibold text-indigo-300">{item.category}</td>
                  <td className="px-4 py-2 font-mono text-slate-200">{item.syntax}</td>
                  <td className="px-4 py-2 text-slate-100">
                    <MathPreview expression={item.preview} compact />
                  </td>
                  <td className="px-4 py-2 text-slate-400">{item.domain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 5. Previo 2: Las 3 Calculadoras ---------------- */}
      <section id="um-previo2" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-300">
            <Dna className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-purple-300 uppercase">Sección 5</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Previo 2: Uso de las 3 Calculadoras de Ecuaciones No Lineales y Polinomios
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* 5.1 Iterativo Secuencial */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-indigo-300">
                <RefreshCw className="size-4" aria-hidden="true" />
                <h3 className="text-sm font-bold">1. Iterativo Secuencial (Punto Fijo)</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Para resolver <span className="font-mono">f(x) = 0</span>, despeja <span className="font-mono">x = g(x)</span>{' '}
                e ingresa la expresión <span className="font-mono">g(x)</span> junto con un valor inicial{' '}
                <span className="font-mono">x₀</span>.
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
                <li>
                  • Itera <span className="font-mono text-slate-200">x₍ₖ₊₁₎ = g(xₖ)</span> hasta que el error relativo
                  porcentual baje de la tolerancia.
                </li>
                <li>
                  • Si <span className="font-mono">|g′(x)| &lt; 1</span> cerca de la raíz, converge; de lo contrario, el
                  sistema te avisará si diverge para que replantees otro despeje <span className="font-mono">g(x)</span>.
                </li>
              </ul>
            </div>

            {onLaunchCalculator ? (
              <button
                type="button"
                onClick={() => onLaunchCalculator('fixed-point')}
                className="no-print mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1.5 text-xs font-bold text-indigo-200 transition hover:bg-indigo-500/25"
              >
                Abrir Punto Fijo
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {/* 5.2 Newton-Raphson */}
          <div className="flex flex-col justify-between rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-300">
                <Zap className="size-4" aria-hidden="true" />
                <h3 className="text-sm font-bold">2. Método de Newton-Raphson</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Ingresa directamente la función <span className="font-mono">f(x)</span> igualada a cero y un punto inicial{' '}
                <span className="font-mono">x₀</span>.
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
                <li>
                  • <strong className="text-slate-200">Derivada automática (switch activo):</strong> Calcula{' '}
                  <span className="font-mono">f′(xₖ)</span> por diferencias finitas centrales sin que tengas que derivar a mano.
                </li>
                <li>
                  • <strong className="text-slate-200">Derivada manual (switch inactivo):</strong> Se abre un segundo editor
                  Photomath para que escribas tu derivada analítica <span className="font-mono">f′(x)</span>.
                </li>
              </ul>
            </div>

            {onLaunchCalculator ? (
              <button
                type="button"
                onClick={() => onLaunchCalculator('newton-raphson')}
                className="no-print mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
              >
                Abrir Newton-Raphson
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {/* 5.3 Bairstow */}
          <div className="flex flex-col justify-between rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-purple-300">
                <Dna className="size-4" aria-hidden="true" />
                <h3 className="text-sm font-bold">3. Método de Bairstow</h3>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Halla <strong className="text-white">todas las raíces reales y complejas</strong> de un polinomio de grado{' '}
                <span className="font-mono">n = 2, 3, 4 o 5</span>.
              </p>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-400">
                <li>
                  • Elige el grado <span className="font-mono">n</span>, escribe los coeficientes desde{' '}
                  <span className="font-mono">xⁿ</span> hasta <span className="font-mono">x⁰</span> y define{' '}
                  <span className="font-mono">r₀, s₀</span>.
                </li>
                <li>
                  • Las raíces reales se muestran en tarjetas <strong className="text-cyan-300">cyan</strong> y los pares
                  complejos conjugados (<span className="font-mono">a ± bi</span>) en tarjetas{' '}
                  <strong className="text-purple-300">violeta</strong>.
                </li>
              </ul>
            </div>

            {onLaunchCalculator ? (
              <button
                type="button"
                onClick={() => onLaunchCalculator('bairstow')}
                className="no-print mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/15 px-2.5 py-1.5 text-xs font-bold text-purple-200 transition hover:bg-purple-500/25"
              >
                Abrir Bairstow
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {/* ---------------- 6. Modo Aprendizaje Paso a Paso ---------------- */}
      <section id="um-aprendizaje" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
            <MousePointerClick className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">Sección 6</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Modo Aprendizaje: Cómo Ver el Desarrollo Paso a Paso de Cualquier Iteración
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          En todas las tablas de resultados de la aplicación (<strong className="text-white">Jacobi, Gauss-Seidel, Punto Fijo, Newton-Raphson y Bairstow</strong>),{' '}
          <strong className="text-emerald-300">cada fila k es interactiva y clicable</strong>. Al hacer clic sobre cualquier
          iteración, se despliega una tarjeta con el desarrollo matemático completo tal como se escribe en un examen:
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs font-bold text-indigo-300">En Previo 1 (Jacobi y Gauss-Seidel)</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Muestra la sustitución numérica en las 3 ecuaciones despejadas y el error relativo individual de{' '}
              <span className="font-mono">x₁, x₂, x₃</span>. En Gauss-Seidel distingue con color{' '}
              <strong className="text-cyan-300">cyan</strong> los valores recién actualizados en la misma iteración{' '}
              <span className="font-mono">k</span> y en <strong className="text-indigo-300">índigo</strong> los que vienen
              de <span className="font-mono">k − 1</span>.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4">
            <p className="text-xs font-bold text-purple-300">En Previo 2 (Especialmente en Bairstow)</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              En Punto Fijo y Newton-Raphson muestra la evaluación de las funciones y la fracción del error relativo. En{' '}
              <strong className="text-slate-200">Bairstow</strong> despliega los arreglos completos{' '}
              <span className="font-mono text-indigo-300">bₙ…b₀</span> y{' '}
              <span className="font-mono text-cyan-300">cₙ…c₁</span> de la doble división sintética, el sistema lineal{' '}
              <span className="font-mono">2×2</span>, el determinante <span className="font-mono">D = c₂² − c₁c₃</span> y el
              cálculo de <span className="font-mono">Δr, Δs</span>.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 7. Casos de Prueba Verificados y Troubleshooting ---------------- */}
      <section id="um-casos" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
            <FlaskConical className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase">Sección 7</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Casos de Estudio Verificados y Guía de Solución de Errores
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          Utiliza estos cuatro ejercicios clásicos (todos incluidos en el botón <strong className="text-white">"Cargar ejemplo"</strong>{' '}
          de cada calculadora) para comprobar la exactitud de los resultados con tolerancia{' '}
          <span className="font-mono text-cyan-300">0.001 %</span>:
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-2.5">Módulo / Método</th>
                <th className="px-4 py-2.5">Problema de Entrada</th>
                <th className="px-4 py-2.5">Valores Iniciales</th>
                <th className="px-4 py-2.5">Resultado Esperado (6 dec.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Previo 1 (Jacobi vs. Gauss-Seidel)</td>
                <td className="px-4 py-2.5 font-mono">4x₁−x₂+x₃=7 ; 4x₁−8x₂+x₃=−21 ; −2x₁+x₂+5x₃=15</td>
                <td className="px-4 py-2.5 font-mono">x⁽⁰⁾ = (0, 0, 0)</td>
                <td className="px-4 py-2.5 font-mono text-emerald-300">
                  x* = (2.000000, 4.000000, 3.000000) · GS: 8 iter / Jacobi: 12 iter
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Punto Fijo (Iterativo Secuencial)</td>
                <td className="px-4 py-2.5 font-mono">g(x) = (exp(-x) + x)/2</td>
                <td className="px-4 py-2.5 font-mono">x₀ = 1.5</td>
                <td className="px-4 py-2.5 font-mono text-emerald-300">x* = 0.567148 (converge en 13 iteraciones)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-cyan-300">Newton-Raphson</td>
                <td className="px-4 py-2.5 font-mono">f(x) = x^3 - 2x - 5</td>
                <td className="px-4 py-2.5 font-mono">x₀ = 2</td>
                <td className="px-4 py-2.5 font-mono text-emerald-300">x* = 2.094551 · |f(x*)| ≈ 1.48×10⁻¹² (4 iter)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-purple-300">Bairstow (Grado 4 Chapra)</td>
                <td className="px-4 py-2.5 font-mono">P(x) = x⁴ − 3.5x³ + 2.75x² + 2.125x − 3.875</td>
                <td className="px-4 py-2.5 font-mono">r₀ = 0 , s₀ = 0</td>
                <td className="px-4 py-2.5 font-mono text-emerald-300">
                  x₁ = 2.000000, x₂ = −1.000000, x₃,₄ = 1.250000 ± 0.866025 i
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Guía rápida de Troubleshooting */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              ¿Por qué Punto Fijo dice "La sucesión divergió"?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Ocurre cuando la pendiente de tu despeje cumple <span className="font-mono">|g′(x)| ≥ 1</span> cerca de la
              raíz (por ejemplo, despejar <span className="font-mono">x = x³ − 5</span> en vez de{' '}
              <span className="font-mono">x = cbrt(x + 5)</span>). Despeja la variable de mayor exponente aplicando una raíz
              o logaritmo para reducir la pendiente.
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              ¿Qué significa "Derivada prácticamente nula" en Newton-Raphson?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Significa que tu valor inicial <span className="font-mono">x₀</span> cayó justo en un máximo o mínimo local
              donde <span className="font-mono">f′(x₀) = 0</span> (por ejemplo, <span className="font-mono">x₀ = 0</span>{' '}
              en <span className="font-mono">x² − 4</span>). Cambia <span className="font-mono">x₀</span> a un número
              distinto (como <span className="font-mono">x₀ = 1</span>) y convergerá de inmediato.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
