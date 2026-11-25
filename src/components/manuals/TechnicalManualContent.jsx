import { Binary, Braces, Cpu, FolderTree, Gauge, Layers, ShieldCheck, Sigma, Terminal } from 'lucide-react';

/** Secciones del Manual Técnico para el índice de navegación lateral. */
export const TECHNICAL_MANUAL_SECTIONS = [
  { id: 'tm-stack', label: '1. Stack y Arquitectura General' },
  { id: 'tm-estructura', label: '2. Estructura de Archivos y Flujo' },
  { id: 'tm-parser', label: '3. Evaluador Matemático y AST' },
  { id: 'tm-lineales', label: '4. Motor Lineal 3×3 (Previo 1)' },
  { id: 'tm-nolineales', label: '5. Motor No Lineal y Bairstow' },
  { id: 'tm-contratos', label: '6. Contratos API y Punto Flotante' },
  { id: 'tm-complejidad', label: '7. Complejidad Big-O y Despliegue' },
];

/**
 * Contenido detallado del Manual Técnico para sustentación de Ingeniería de Software.
 */
export default function TechnicalManualContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* ---------------- 1. Stack y Arquitectura General ---------------- */}
      <section id="tm-stack" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
            <Cpu className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-cyan-300 uppercase">Sección 1</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Ficha Técnica, Stack Tecnológico y Principios de Ingeniería
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          El sistema está diseñado bajo una arquitectura <strong className="text-white">100 % cliente (Zero-Network Runtime PWA)</strong>{' '}
          con separación estricta entre los <strong className="text-cyan-300">motores matemáticos puros</strong>{' '}
          (<span className="font-mono">src/utils/</span>) y la <strong className="text-indigo-300">capa de interfaz React</strong>{' '}
          (<span className="font-mono">src/components/</span>). No utiliza ninguna librería matemática externa: tanto el
          analizador sintáctico (parser AST) como los cinco algoritmos numéricos fueron implementados desde cero en
          JavaScript ES Modules.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-2.5">Capa</th>
                <th className="px-4 py-2.5">Tecnología / Versión</th>
                <th className="px-4 py-2.5">Justificación Técnica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">UI Reactiva</td>
                <td className="px-4 py-2.5 font-mono">React 19.2.0</td>
                <td className="px-4 py-2.5">
                  Renderizado declarativo del árbol sintáctico 2D (<span className="font-mono">MathPreview</span>),
                  sincronización de cursor y estados inmutables por iteración.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Empaquetador</td>
                <td className="px-4 py-2.5 font-mono">Vite 7.1.0</td>
                <td className="px-4 py-2.5">
                  Build optimizado con ES Modules nativos y recarga instantánea en desarrollo.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Sistema de Diseño</td>
                <td className="px-4 py-2.5 font-mono">Tailwind CSS 4.1 + CSS Layers</td>
                <td className="px-4 py-2.5">
                  Tema Dark Mode (<span className="font-mono">slate-950</span>), glassmorphism y clases tipográficas
                  personalizadas para fracciones verticales (<span className="font-mono">.math-frac</span>) y radicales SVG.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">PWA / Offline</td>
                <td className="px-4 py-2.5 font-mono">vite-plugin-pwa 1.0 (Workbox)</td>
                <td className="px-4 py-2.5">
                  Generación automática de Service Worker (<span className="font-mono">generateSW</span>) que precachea
                  todos los assets para operación offline completa.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-semibold text-indigo-300">Aritmética</td>
                <td className="px-4 py-2.5 font-mono">IEEE 754 Double Precision (64 bits)</td>
                <td className="px-4 py-2.5">
                  Los bucles iterativos operan con toda la mantisa de 53 bits (~15-17 dígitos significativos); el redondeo
                  a 6 decimales (<span className="font-mono">round6</span> / <span className="font-mono">toFixed(6)</span>)
                  se aplica solo en la capa de salida para evitar propagación de error de redondeo intermedio.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 2. Estructura de Archivos y Flujo de Datos ---------------- */}
      <section id="tm-estructura" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <FolderTree className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 2</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Arquitectura de Directorios y Flujo Unidireccional de Datos
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <pre className="scrollbar-slim overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-300">
{`src/
├── App.jsx                        # Shell, Header, Router de vistas y Tour
├── main.jsx                       # Punto de montaje React 19
├── index.css                      # Sistema visual y tipografía matemática 2D
├── components/
│   ├── GuidedTourModal.jsx        # Motor de recorrido guiado contextual
│   ├── manuals/                   # Documentación integrada en la app
│   │   ├── ManualsView.jsx
│   │   ├── UserManualContent.jsx
│   │   └── TechnicalManualContent.jsx
│   ├── previo1/                   # Módulo 1: Sistemas Lineales 3×3
│   │   ├── Previo1View.jsx
│   │   ├── MatrixInput.jsx
│   │   ├── DominanceCard.jsx
│   │   ├── DuelCard.jsx
│   │   ├── ResultsTable.jsx
│   │   └── EmptyState.jsx
│   └── previo2/                   # Módulo 2: No Lineales y Polinomios
│       ├── Previo2View.jsx
│       ├── SequentialIterativeCalculator.jsx
│       ├── NewtonRaphsonCalculator.jsx
│       ├── BairstowCalculator.jsx
│       ├── FormControls.jsx       # Editor interactivo Photomath
│       ├── MathPreview.jsx        # Renderizador AST -> Notación 2D
│       ├── MathKeypad.jsx         # Teclado split (Plantillas + Numpad)
│       ├── mathEditing.js         # Transformaciones puras de cursor
│       ├── CalculatorLayout.jsx
│       ├── ResultCards.jsx
│       └── format.js
└── utils/                         # Motores matemáticos puros (0% React)
    ├── mathEvaluator.js           # Lexer, Parser recursivo y compilador AST
    ├── numericalMethods.js        # Jacobi, Gauss-Seidel, Pivoteo, Residual
    └── nonlinearMethods.js        # Punto Fijo, Newton-Raphson y Bairstow`}
          </pre>

          <div className="flex flex-col justify-between gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <Layers className="size-4 text-cyan-400" aria-hidden="true" />
                Flujo de Ejecución en Tiempo Real
              </h3>
              <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
                <li>
                  <strong className="text-indigo-300">1. Captura y Edición Asistida:</strong> El usuario interactúa con{' '}
                  <span className="font-mono">MathKeypad.jsx</span> o hace clic en un hueco <span className="font-mono">□</span>{' '}
                  de <span className="font-mono">MathPreview.jsx</span>. Las funciones puras de{' '}
                  <span className="font-mono">mathEditing.js</span> actualizan <span className="font-mono">{`{ value, start, end }`}</span>.
                </li>
                <li>
                  <strong className="text-cyan-300">2. Parsing Tolerante en Vivo:</strong> En cada pulsación,{' '}
                  <span className="font-mono">parseExpressionAST(expr)</span> genera un AST anotado con rangos de carácter{' '}
                  <span className="font-mono">[start, end, caret]</span>, convirtiendo paréntesis vacíos en nodos{' '}
                  <span className="font-mono">slot</span> sin lanzar excepciones.
                </li>
                <li>
                  <strong className="text-emerald-300">3. Compilación y Ejecución Numérica:</strong> Al pulsar{' '}
                  <em>Calcular</em>, <span className="font-mono">compileExpression(expr)</span> valida la expresión en modo
                  estricto y la compila una sola vez en un árbol de clausuras <span className="font-mono">(x) =&gt; number</span>,
                  que el método iterativo invoca en cada paso <span className="font-mono">k</span> sin re-parsear texto.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Seguridad por Diseño (Sin eval)
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Ninguna entrada del usuario pasa jamás por <span className="font-mono">eval()</span> ni{' '}
                <span className="font-mono">new Function()</span>. Esto elimina cualquier vector de inyección de código
                y permite emitir mensajes de error matemáticos exactos en español (división entre cero, logaritmo de número
                no positivo, raíz par de número negativo o paréntesis sin cerrar).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. Evaluador Matemático y AST ---------------- */}
      <section id="tm-parser" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-purple-300">
            <Braces className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-purple-300 uppercase">Sección 3</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Evaluador Matemático por Descenso Recursivo (<span className="font-mono">mathEvaluator.js</span>)
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-slate-100">Gramática Formal LL(1) y Precedencia</h3>
            <pre className="mt-2.5 overflow-x-auto rounded-xl bg-slate-950/80 p-3 font-mono text-xs leading-relaxed text-cyan-200">
{`expression := term (('+' | '-') term)*
term       := unary (('*' | '/') unary | unary)*
unary      := ('+' | '-') unary | power
power      := primary ('^' unary)?
primary    := NUMBER | CONSTANT | 'x'
            | FUNCTION '(' expression (',' expression)* ')'
            | '(' expression ')'`}
            </pre>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
              <li>
                • <strong className="text-white">Asociatividad a derecha en potencias:</strong>{' '}
                <span className="font-mono">parsePower</span> delega su exponente a <span className="font-mono">parseUnary</span>,
                permitiendo expresiones como <span className="font-mono">2^-x</span> o <span className="font-mono">x^2^3</span>.
              </li>
              <li>
                • <strong className="text-white">Multiplicación implícita:</strong> Cuando{' '}
                <span className="font-mono">parseTerm</span> detecta que el siguiente token inicia un factor (número,
                identificador o <span className="font-mono">(</span>), inserta un nodo binario{' '}
                <span className="font-mono">{`{ type: 'bin', op: '*', implicit: true }`}</span>.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-slate-100">Innovaciones del Lexer y AST Dual</h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
              <li>
                • <strong className="text-indigo-300">Desambiguación contextual de la coma:</strong> El lexer mantiene una
                pila <span className="font-mono">callStack</span> con la función abierta. Fuera de funciones de 2
                argumentos, <span className="font-mono">2,5</span> se interpreta como el decimal{' '}
                <span className="font-mono">2.5</span>; pero dentro de <span className="font-mono">nroot(8,3)</span> la
                coma se tokeniza como separador de argumentos sin exigir espacio.
              </li>
              <li>
                • <strong className="text-cyan-300">Segmentación de identificadores pegados:</strong>{' '}
                <span className="font-mono">splitIdentifier</span> compara prefijos por longitud descendente contra{' '}
                <span className="font-mono">KNOWN_NAMES</span>, separando automáticamente <span className="font-mono">pix</span>{' '}
                en <span className="font-mono">pi · x</span> o <span className="font-mono">2xsin(x)</span> en{' '}
                <span className="font-mono">2 · x · sin(x)</span>.
              </li>
              <li>
                • <strong className="text-purple-300">Mapeo bidireccional Cursor ↔ Nodo 2D:</strong> Cada nodo almacena{' '}
                <span className="font-mono">{`{ start, end, caret }`}</span>. Así, cuando el usuario hace clic sobre un
                cuadro vacío <span className="font-mono">□</span> en <span className="font-mono">MathPreview.jsx</span>, el
                editor invoca <span className="font-mono">input.setSelectionRange(node.caret, node.caret)</span>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- 4. Motor Lineal 3×3 (Previo 1) ---------------- */}
      <section id="tm-lineales" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <Binary className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 4</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Motor de Sistemas Lineales 3×3 (<span className="font-mono">src/utils/numericalMethods.js</span>)
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-indigo-300">1. Núcleo Iterativo Unificado</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Tanto <span className="font-mono">solveJacobi</span> como <span className="font-mono">solveGaussSeidel</span>{' '}
              delegan en la función interna <span className="font-mono">iterate(A, b, x0, tol, maxIter, useLatestValues)</span>:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/80 p-2.5 font-mono text-[11px] text-slate-200">
{`const source = useLatestValues
  ? current   // Gauss-Seidel (k)
  : previous; // Jacobi (k - 1)
let sum = b[i];
for (let j = 0; j < 3; j++) {
  if (j !== i) sum -= A[i][j] * source[j];
}
current[i] = sum / A[i][i];`}
            </pre>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-cyan-300">2. Norma Infinito del Error Relativo</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              En cada iteración <span className="font-mono">k ≥ 1</span> se calcula el error relativo porcentual de cada
              componente y se toma el máximo de los tres como criterio de corte:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/80 p-2.5 font-mono text-[11px] text-slate-200">
{`εᵢ = |(xᵢ⁽ᵏ⁾ - xᵢ⁽ᵏ⁻¹⁾) / xᵢ⁽ᵏ⁾| × 100
εₐ = max(ε₁, ε₂, ε₃) ≤ tolerancia`}
            </pre>
            <p className="mt-2 text-xs text-slate-400">
              Si <span className="font-mono">xᵢ⁽ᵏ⁾ = 0</span>, se emplea el error absoluto escalado para evitar división
              por cero.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-amber-300">3. Pivoteo Óptimo de Filas</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              <span className="font-mono">findBestRowPermutation(A)</span> evalúa las <span className="font-mono">3! = 6</span>{' '}
              permutaciones posibles de las filas calificando:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              <li>1. Ausencia total de ceros en la diagonal (<span className="font-mono">aᵢᵢ ≠ 0</span>).</li>
              <li>2. Mayor cantidad de filas con dominancia estricta (<span className="font-mono">|aᵢᵢ| &gt; Σ|aᵢⱼ|</span>).</li>
              <li>3. Mayor cociente acumulado <span className="font-mono">Σ |aᵢᵢ| / (Σ|aᵢⱼ| + ε)</span>.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- 5. Motor No Lineal y Bairstow ---------------- */}
      <section id="tm-nolineales" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-300">
            <Sigma className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-emerald-300 uppercase">Sección 5</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Algoritmos de Ecuaciones No Lineales y Polinomios (<span className="font-mono">nonlinearMethods.js</span>)
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-indigo-300">
              Punto Fijo (<span className="font-mono">solveFixedPoint</span>) y Newton-Raphson (<span className="font-mono">solveNewtonRaphson</span>)
            </h3>
            <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
              <li>
                • <strong className="text-white">Punto Fijo:</strong> Evalúa la recurrencia{' '}
                <span className="font-mono">x₍ₖ₊₁₎ = g(xₖ)</span>, registra <span className="font-mono">Δx = g(xₖ) − xₖ</span>{' '}
                y corta por divergencia si <span className="font-mono">|x₍ₖ₊₁₎| &gt; 10¹²</span>. Al finalizar verifica{' '}
                <span className="font-mono">g(x*) ≈ x*</span>.
              </li>
              <li>
                • <strong className="text-white">Newton-Raphson y Diferencias Centrales:</strong> Cuando el modo automático
                está activo, aproxima la derivada mediante el esquema centrado de orden <span className="font-mono">O(h²)</span>:
                <pre className="mt-1.5 rounded-lg bg-slate-950/80 p-2 font-mono text-[11px] text-cyan-200">
{`f′(x) ≈ ( f(x + h) − f(x − h) ) / (2h) ,   h = 10⁻⁶`}
                </pre>
              </li>
              <li>
                • <strong className="text-white">Protección de Tangente Horizontal:</strong> Si{' '}
                <span className="font-mono">|f′(xₖ)| &lt; 10⁻¹²</span>, el algoritmo aborta con estado{' '}
                <span className="font-mono">'zero-derivative'</span> antes de dividir entre cero.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-purple-300">
              Método de Bairstow (<span className="font-mono">solveBairstow</span>) y Deflación Polinomial
            </h3>
            <ol className="mt-2.5 space-y-2 text-xs leading-relaxed text-slate-300">
              <li>
                <strong className="text-white">1. Extracción de raíces nulas:</strong> Si el término independiente{' '}
                <span className="font-mono">a₀ = 0</span>, factoriza potencias de <span className="font-mono">x</span> de
                forma exacta antes de iterar para evitar que el sistema <span className="font-mono">2×2</span> nazca singular.
              </li>
              <li>
                <strong className="text-white">2. Doble División Sintética:</strong> Divide el polinomio entre{' '}
                <span className="font-mono">x² − rx − s</span> mediante la recurrencia:
                <pre className="mt-1 rounded-lg bg-slate-950/80 p-2 font-mono text-[11px] text-purple-200">
{`bᵢ = aᵢ + r·bᵢ₊₁ + s·bᵢ₊₂
cᵢ = bᵢ + r·cᵢ₊₁ + s·cᵢ₊₂`}
                </pre>
              </li>
              <li>
                <strong className="text-white">3. Sistema Lineal 2×2 y Regla de Cramer:</strong> Con determinante{' '}
                <span className="font-mono">D = c₂² − c₁·c₃</span>, calcula las correcciones:
                <pre className="mt-1 rounded-lg bg-slate-950/80 p-2 font-mono text-[11px] text-purple-200">
{`Δr = (−b₁·c₂ + b₀·c₃) / D  ;  Δs = (−b₀·c₂ + b₁·c₁) / D`}
                </pre>
              </li>
              <li>
                <strong className="text-white">4. Discriminante, Deflación y Horner Complejo:</strong> Una vez{' '}
                <span className="font-mono">εr, εs ≤ tol</span>, halla las dos raíces del factor con{' '}
                <span className="font-mono">Dq = r² + 4s</span> (reales si <span className="font-mono">Dq ≥ 0</span>,
                complejas conjugadas si <span className="font-mono">Dq &lt; 0</span>), deflaciona el polinomio tomando el
                cociente <span className="font-mono">b₂…bₙ</span> y verifica cada raíz evaluando{' '}
                <span className="font-mono">|P(xᵢ)|</span> en aritmética compleja mediante el esquema de Horner.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------- 6. Contratos de API, Umbrales y Estabilidad Numérica ---------------- */}
      <section id="tm-contratos" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
            <Gauge className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-amber-300 uppercase">Sección 6</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Contratos de API, Umbrales Numéricos y Guardas de Punto Flotante
            </h2>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          Los motores numéricos definen constantes de protección calibradas para aritmética IEEE 754 de 64 bits que evitan
          bucles infinitos, divisiones por cero o falsas raíces complejas por ruido de redondeo:
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-2.5">Constante / Función</th>
                <th className="px-4 py-2.5">Valor / Firma</th>
                <th className="px-4 py-2.5">Propósito de Estabilidad Numérica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-indigo-300">DECIMALS / round6(v)</td>
                <td className="px-4 py-2.5 font-mono">6 cifras (10⁶)</td>
                <td className="px-4 py-2.5">
                  Corrige el sesgo binario agregando <span className="font-mono">Number.EPSILON * Math.sign(v)</span> antes
                  de redondear la salida final.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-cyan-300">DERIVATIVE_STEP (h)</td>
                <td className="px-4 py-2.5 font-mono">1 × 10⁻⁶</td>
                <td className="px-4 py-2.5">
                  Paso óptimo para diferencias finitas centrales: equilibra el error de truncamiento de Taylor{' '}
                  <span className="font-mono">O(h²) ≈ 10⁻¹²</span> frente al error de cancelación sustractiva de máquina.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-amber-300">ZERO_DERIVATIVE</td>
                <td className="px-4 py-2.5 font-mono">1 × 10⁻¹²</td>
                <td className="px-4 py-2.5">
                  Umbral inferior para <span className="font-mono">|f′(xₖ)|</span> en Newton-Raphson; detiene la iteración
                  cuando la tangente es horizontal.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-purple-300">SINGULAR_DETERMINANT</td>
                <td className="px-4 py-2.5 font-mono">1 × 10⁻¹⁴</td>
                <td className="px-4 py-2.5">
                  Si <span className="font-mono">|c₂² − c₁c₃| &lt; 10⁻¹⁴</span> en Bairstow, perturba{' '}
                  <span className="font-mono">(r, s) ← (r+1, s+1)</span> hasta 3 veces para escapar del punto singular.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-emerald-300">Guarda de Raíz Doble Real</td>
                <td className="px-4 py-2.5 font-mono">|Dq| &lt; 10⁻¹⁰ · escala</td>
                <td className="px-4 py-2.5">
                  En <span className="font-mono">quadraticFactorRoots(r, s)</span>, si el discriminante{' '}
                  <span className="font-mono">r² + 4s</span> deja un residuo negativo minúsculo (ej.{' '}
                  <span className="font-mono">−10⁻¹³</span>) en una raíz doble real como <span className="font-mono">(x − 1)²</span>,
                  se fuerza a <span className="font-mono">0</span> para no reportarla falsamente como compleja.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono font-bold text-rose-300">DIVERGENCE_LIMIT</td>
                <td className="px-4 py-2.5 font-mono">1 × 10¹²</td>
                <td className="px-4 py-2.5">
                  Corta inmediatamente cualquier sucesión cuyas aproximaciones superen <span className="font-mono">10¹²</span>{' '}
                  o produzcan <span className="font-mono">NaN / Infinity</span>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- 7. Complejidad Algorítmica y Scripts de Despliegue ---------------- */}
      <section id="tm-complejidad" className="card p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
            <Terminal className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Sección 7</p>
            <h2 className="text-lg font-bold text-slate-100 sm:text-xl">
              Complejidad Algorítmica (Big-O), Scripts NPM y Despliegue PWA
            </h2>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-800/90 text-[11px] font-bold tracking-wide text-slate-300 uppercase">
                <tr>
                  <th className="px-3.5 py-2.5">Algoritmo / Módulo</th>
                  <th className="px-3.5 py-2.5">Tiempo</th>
                  <th className="px-3.5 py-2.5">Espacio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40 text-slate-300">
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-indigo-300">Parser AST (compileExpression)</td>
                  <td className="px-3.5 py-2 font-mono">O(L) una sola vez</td>
                  <td className="px-3.5 py-2 font-mono">O(L) nodos</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-indigo-300">Jacobi / Gauss-Seidel (3×3)</td>
                  <td className="px-3.5 py-2 font-mono">O(K · N²) con N=3</td>
                  <td className="px-3.5 py-2 font-mono">O(K) filas</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-amber-300">Pivoteo findBestRowPermutation</td>
                  <td className="px-3.5 py-2 font-mono">O(N! · N²) = 54 ops</td>
                  <td className="px-3.5 py-2 font-mono">O(1)</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-cyan-300">Punto Fijo / Newton-Raphson</td>
                  <td className="px-3.5 py-2 font-mono">O(K · |AST|)</td>
                  <td className="px-3.5 py-2 font-mono">O(K) filas</td>
                </tr>
                <tr>
                  <td className="px-3.5 py-2 font-semibold text-purple-300">Bairstow con Deflación (grado n)</td>
                  <td className="px-3.5 py-2 font-mono">O(n² · K)</td>
                  <td className="px-3.5 py-2 font-mono">O(n · K)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <h3 className="text-sm font-bold text-slate-100">Comandos de Entorno y Compilación</h3>
            <pre className="mt-2.5 overflow-x-auto rounded-xl bg-slate-950/80 p-3 font-mono text-xs leading-relaxed text-emerald-300">
{`# 1. Instalar dependencias (Node.js >= 20)
npm install

# 2. Servidor de desarrollo con HMR
npm run dev

# 3. Compilar bundle de producción + Service Worker PWA
npm run build

# 4. Previsualizar build de producción localmente
npm run preview`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}
