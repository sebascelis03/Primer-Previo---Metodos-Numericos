# Bitácora Cronológica de Toma de Decisiones

Registro histórico e incremental de las decisiones arquitectónicas, funcionales y estéticas tomadas en el proyecto, así como los problemas resueltos en cada iteración.

---

## Hito 1 — Fundación del Proyecto y Motor de Sistemas Lineales 3×3 (Previo 1)
- **Contexto:** Construcción de una aplicación PWA local para resolver sistemas de ecuaciones lineales $3\times3$ mediante los métodos iterativos de Jacobi y Gauss-Seidel.
- **Decisiones Técnicas:**
  - Separar estrictamente el motor matemático (`src/utils/numericalMethods.js`) de la capa de presentación React.
  - Conservar la precisión completa de punto flotante (`IEEE 754`) durante todas las iteraciones internas y aplicar redondeo a 6 decimales (`round6`) únicamente al generar las filas de salida.
  - Utilizar como criterio de parada el error relativo porcentual máximo entre las tres incógnitas: $\varepsilon_a = \max_i \left|\frac{x_i^{(k)} - x_i^{(k-1)}}{x_i^{(k)}}\right| \times 100\% \le \text{tol}$.
  - Tratar la dominancia diagonal estricta como una **advertencia ámbar no bloqueante** (condición suficiente pero no necesaria), mientras que un cero en la diagonal principal sí lanza un error bloqueante por división entre cero.
  - Incorporar verificación independiente mediante el vector residual $r = b - A \cdot x$ y el **Modo Duelo** para contrastar Jacobi vs. Gauss-Seidel.

---

## Hito 2 — Transformación Visual a Dark Mode, Glassmorphism y Hero Header
- **Contexto:** Evolucionar la interfaz desde un tema claro genérico hacia una estética académica de alto impacto visual para la presentación universitaria en la FESC.
- **Decisiones Técnicas y de Diseño (`commits 6c00517` y `8c8df96`):**
  - Migración integral a **Dark Mode** sobre `slate-950` con halos radiales `indigo` y `cyan` y tarjetas glassmorphism (`bg-white/5 backdrop-blur-xl border-white/10`).
  - Asignación de identidad cromática por método: **Indigo** para Jacobi y **Cyan** para Gauss-Seidel, con gradiente combinado para el Modo Duelo.
  - Inclusión de corchetes matemáticos CSS `[ ]` en la cuadrícula de la matriz $3\times3$ y el vector $b$.
  - Rediseño del encabezado como **Hero Header** centrado con menú desplegable tipo hamburguesa para presentar a los integrantes del equipo de Ingeniería de Software (FESC 2026-2) y eliminación del badge "100% local".

---

## Hito 3 — Expansión a Previo 2 y Modularización de Vistas
- **Contexto:** Incorporar un segundo módulo académico (**Previo 2**) con 3 calculadoras para raíces de ecuaciones no lineales y polinomios, manteniendo intacto el módulo de Previo 1.
- **Decisiones Técnicas (`commit f595de9`):**
  - Reorganizar los componentes en dos subcarpetas dedicadas: `src/components/previo1/` y `src/components/previo2/`, agregando un selector global de pestañas (`Previo 1` / `Previo 2`) en el Header.
  - Construir un **evaluador matemático propio por descenso recursivo** (`src/utils/mathEvaluator.js`) con soporte para multiplicación implícita (`2x`, `3(x+1)`), potencias (`^`), constantes (`pi`, `e`) y funciones trascendentes (`sin`, `cos`, `tan`, `exp`, `ln`, `sqrt`, `abs`), evitando por completo el uso de `eval()` por seguridad y control de errores.
  - Implementar en `src/utils/nonlinearMethods.js` los tres algoritmos:
    1. **Iterativo Secuencial (Punto Fijo):** $x_{k+1} = g(x_k)$ con detección de divergencia ($|x| > 10^{12}$).
    2. **Newton-Raphson:** Con soporte dual para derivada analítica manual o derivada numérica automática por diferencias finitas centrales ($h = 10^{-6}$).
    3. **Bairstow:** Extracción iterativa de factores cuadráticos $x^2 - rx - s$ con doble división sintética, determinante $2\times2$ y deflación sucesiva para hallar raíces reales y complejas conjugadas en polinomios de grado 2 a 5.

---

## Hito 4 — Adopción de Reglas Operativas Estrictas y Fuente Única de Verdad (`.docs/`)
- **Fecha:** 24 de noviembre de 2026 (`PLAN_01`)
- **Contexto:** Establecer gobernanza documental y control total del usuario sobre los cambios de código y sobre Git.
- **Decisiones Tomadas:**
  - Formalizar las 3 reglas operativas en `.docs/01_reglas/REGLAS_OPERATIVAS.md` (planificación obligatoria previa, cero comandos `git` ejecutados por el asistente, y política de compactación en `.docs/`).
  - Migrar y estructurar todo el conocimiento disperso de la carpeta antigua `docs/` hacia las 6 subcarpetas oficiales de `.docs/`, eliminando la carpeta antigua `docs/` para evitar duplicidad.

---

## Hito 5 — Teclado Matemático Visual y Vista Previa en Tiempo Real (`PLAN_02`)
- **Fecha:** 24 de noviembre de 2026
- **Decisiones:**
  - El parser de `mathEvaluator.js` ahora genera un **AST** que sirve tanto para compilar `f(x)` como para dibujar la vista previa (lo que se ve es exactamente lo que se evalúa).
  - Se mantuvo un renderizador propio (React + CSS) en lugar de KaTeX: no requiere dependencias nuevas y sigue funcionando 100 % offline.
  - Modo tolerante del parser: los operandos faltantes se muestran como recuadros punteados (`slot`) y los paréntesis abiertos se cierran solos en la vista previa.
  - Nuevas funciones: `cbrt(x)`, `nroot(x, n)` / `root(x, n)`. La coma es decimal solo entre dígitos (`2,5`); en otro caso separa argumentos (también se acepta `;`).
  - Los identificadores pegados se separan solos (`pix` → `pi·x`, `x2` → `x·2`).
  - Se agregó `src/components/previo2/mathEditing.js` (funciones puras de edición del cursor), un archivo que no estaba en el plan original.
