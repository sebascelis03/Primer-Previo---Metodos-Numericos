# Documento Maestro — Plataforma PWA de Métodos Numéricos (FESC 2026-2)

## 1. Identificación del Proyecto
- **Nombre del Proyecto:** Plataforma Interactiva de Métodos Numéricos (`sistemas-lineales-iterativos`)
- **Institución:** Fundación de Estudios Superiores Comfanorte (FESC)
- **Programa:** Ingeniería de Software · Semestre 2026-2
- **Asignatura:** Métodos Numéricos
- **Equipo de Desarrollo:**
  - Andres Esteban Sandoval Carreño
  - Jhoan Sebastian Celis Pabon
  - Zharick Nicoll Acevedo Ascanio
- **Repositorio Oficial:** `https://github.com/sebascelis03/Primer-Previo---Metodos-Numericos`

---

## 2. Qué es el Proyecto y Qué Problema Resuelve
Es una aplicación web progresiva (**PWA 100% local y offline**) diseñada como herramienta académica, pedagógica y de verificación para la asignatura de **Métodos Numéricos**.

Resuelve la necesidad de:
1. Ejecutar algoritmos numéricos iterativos con **precisión de punto flotante completo** internamente y salida formateada a **6 cifras decimales** según el criterio académico de Chapra & Canale.
2. Visualizar paso a paso cada iteración ($k$), el comportamiento del error relativo porcentual ($\varepsilon_a$) y las condiciones de convergencia o divergencia.
3. Comparar empíricamente la velocidad de convergencia entre métodos y comprobar las soluciones mediante evaluación de residuales independientes.

---

## 3. Objetivos Funcionales y Módulos Académicos

### 🔹 Módulo 1: Previo 1 — Sistemas de Ecuaciones Lineales 3×3
Resolución iterativa de sistemas matriciales $A \cdot x = b$ de dimensión $3\times3$:
- **Método de Jacobi:** Actualización simultánea usando exclusivamente los valores de la iteración anterior $x^{(k-1)}$.
- **Método de Gauss-Seidel:** Actualización inmediata utilizando los valores recién calculados en la misma iteración $x^{(k)}$.
- **Modo Duelo:** Ejecución paralela de Jacobi vs. Gauss-Seidel con comparativa visual de iteraciones requeridas, barras de progreso animadas y veredicto automático de eficiencia.
- **Diagnóstico de Dominancia Diagonal Estricta:** Verificación fila por fila de $|a_{ii}| > \sum_{j \ne i} |a_{ij}|$ y detección de ceros en la diagonal principal.
- **Verificación por Vector Residual:** Cálculo independiente $r = b - A \cdot x$ para validar la exactitud de la solución aproximada.

### 🔹 Módulo 2: Previo 2 — Ecuaciones No Lineales y Raíces de Polinomios
Conjunto de 3 calculadoras especializadas con evaluador matemático seguro por descenso recursivo:
1. **Iterativo Secuencial (Punto Fijo / Sustitución Sucesiva):**
   - Resuelve $x = g(x)$ mediante la recurrencia $x_{k+1} = g(x_k)$ a partir de un valor inicial $x_0$.
   - Calcula $\Delta x$, error relativo porcentual $\varepsilon_a$ y comprobación $g(x^*) \approx x^*$.
2. **Método de Newton-Raphson:**
   - Resuelve $f(x) = 0$ mediante la fórmula tangencial $x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}$.
   - Permite elegir entre **derivada automática** (diferencias finitas centrales con $h = 10^{-6}$) o **derivada analítica manual** $f'(x)$ ingresada por el usuario.
   - Detecta derivada nula ($|f'(x_k)| < 10^{-12}$) y reporta el residual $|f(x^*)|$.
3. **Método de Bairstow (Polinomios de grado 2 a 5):**
   - Extrae **todas las raíces reales y complejas conjugadas** de un polinomio $P(x) = a_n x^n + \dots + a_0$.
   - Aplica doble división sintética para extraer factores cuadráticos $x^2 - r x - s$, resolviendo el sistema $2\times2$ de correcciones $(\Delta r, \Delta s)$ y aplicando deflación polinomial sucesiva.

---

## 4. Arquitectura General y Stack Tecnológico

### Stack Tecnológico
| Capa | Tecnología |
| :--- | :--- |
| **Framework UI** | React 19 (`react`, `react-dom`) |
| **Empaquetador / Dev Server** | Vite 7 (`@vitejs/plugin-react`) |
| **Estilos** | Tailwind CSS 4 (`@tailwindcss/vite`) |
| **Iconografía** | `lucide-react` |
| **PWA / Offline** | `vite-plugin-pwa` (Workbox con precache completo) |
| **Motor Matemático** | JavaScript ES Modules puros + Parser por descenso recursivo (sin `eval()`) |

### Estructura de Directorios del Código (`src/`)
```text
src/
├── App.jsx                                  # Shell principal, Hero Header, menú de equipo y selector Previo 1 / Previo 2
├── main.jsx                                 # Punto de entrada React
├── index.css                                # Directivas Tailwind v4, clases utilitarias glassmorphism y corchetes matriciales
├── components/
│   ├── previo1/                             # Vista y componentes de Sistemas Lineales 3×3
│   │   ├── Previo1View.jsx
│   │   ├── MatrixInput.jsx
│   │   ├── DominanceCard.jsx
│   │   ├── DuelCard.jsx
│   │   ├── ResultsTable.jsx
│   │   └── EmptyState.jsx
│   └── previo2/                             # Vista y calculadoras de Ecuaciones No Lineales y Polinomios
│       ├── Previo2View.jsx
│       ├── SequentialIterativeCalculator.jsx
│       ├── NewtonRaphsonCalculator.jsx
│       ├── BairstowCalculator.jsx
│       ├── CalculatorLayout.jsx
│       ├── FormControls.jsx
│       ├── ResultCards.jsx
│       └── format.js
└── utils/                                   # Motores matemáticos puros (sin acoplamiento a React)
    ├── numericalMethods.js                  # Jacobi, Gauss-Seidel, dominancia diagonal, residual, error relativo
    ├── nonlinearMethods.js                  # Punto Fijo, Newton-Raphson y Bairstow con deflación
    └── mathEvaluator.js                     # Tokenizer y parser recursivo seguro para expresiones f(x) y g(x)
```
