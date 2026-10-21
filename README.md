# Métodos Numéricos — FESC 2026-2

Plataforma PWA local y responsiva desarrollada para la asignatura de **Métodos Numéricos** (Ingeniería de Software · FESC).

No realiza ninguna petición de red en tiempo de ejecución: todo el cálculo ocurre en el navegador y el service worker precachea el shell completo para uso sin conexión.

---

## Módulos y Contenido Académico

### 🔹 Previo 1: Sistemas de Ecuaciones Lineales 3×3
- **Métodos**: Jacobi y Gauss-Seidel.
- **Modo Duelo**: Comparativa directa de velocidad y convergencia.
- **Diagnóstico matricial**: Verificación de dominancia diagonal estricta $|a_{ii}| > \sum_{j \ne i} |a_{ij}|$ y ceros en diagonal.
- **Comprobación**: Vector residual $r = b - A \cdot x$.

### 🔹 Previo 2: Ecuaciones No Lineales y Raíces de Polinomios
- **1. Iterativo Secuencial (Punto Fijo)**: Resuelve $x = g(x)$ paso a paso con error relativo $\varepsilon_a$.
- **2. Método de Newton-Raphson**: Resuelve $f(x) = 0$ con soporte de derivada automática o analítica/manual.
- **3. Método de Bairstow**: Extracción de **todas las raíces (reales y complejas)** de polinomios de grado 2 a 5 mediante factores cuadráticos $x^2 - rx - s$ y deflación sucesiva.

---

## Stack Tecnológico

| Capa        | Tecnología                                    |
| ----------- | --------------------------------------------- |
| Frontend    | React 19 + Vite 7                             |
| Estilos     | Tailwind CSS 4 (`@tailwindcss/vite`)          |
| Componentes | Lucide React + Glassmorphism UI Dark Mode     |
| PWA         | `vite-plugin-pwa` (Workbox offline completo)  |
| Matemáticas | Evaluador por descenso recursivo (sin `eval`) |
| `maxIterations` | `number`     | `50`        | Corte de seguridad                       |

Ambas devuelven un arreglo de objetos, uno por iteración:

```js
{ k: 3, x1: 1.925, x2: 3.85, x3: 2.8875, error: 13.961039, isConverged: false }
```

- La fila `k = 0` corresponde al vector inicial y tiene `error: null`.
- Todos los valores del arreglo se redondean a **6 cifras decimales**; el cálculo interno
  se realiza con la precisión completa de punto flotante.
- El proceso se detiene cuando el error relativo porcentual máximo entre las tres variables
  cae por debajo de la tolerancia (`isConverged: true`) o al alcanzar `maxIterations`.
- Un cero en la diagonal principal lanza un `Error` con mensaje explicativo.

### `checkDiagonalDominance(A)`

Verifica el criterio |a_ii| > Σ|a_ij| (j ≠ i) en cada fila. Devuelve:

```js
{
  isDominant: true,        // booleano
  hasZeroDiagonal: false,
  message: '...',          // explicación legible del resultado
  rows: [{ index, diagonal, sum, ok }, ...]
}
```

La dominancia diagonal estricta es condición **suficiente pero no necesaria** para la
convergencia: la interfaz advierte en ámbar cuando no se cumple, pero permite ejecutar igual.

### Auxiliares

- `summarize(history)` → `{ status, converged, iterations, solution, finalError, rows }`,
  donde `status` es `'converged' | 'max-iterations' | 'diverged'`.
- `residual(A, b, x)` → vector `r = b − A·x`, verificación independiente del criterio de parada.
- `relativeError(current, previous)` y `round6(value)`.

## Criterio de parada

```
εₐ = máx | (xᵢ⁽ᵏ⁾ − xᵢ⁽ᵏ⁻¹⁾) / xᵢ⁽ᵏ⁾ | × 100 %  ≤  tolerancia
```

La tolerancia se interpreta como **porcentaje**, de modo que el valor por defecto `0.001`
equivale a un error relativo del 0.001 %.

## Ejemplo incluido

```
 4x₁ −  x₂ +  x₃ =   7
 4x₁ − 8x₂ +  x₃ = −21
−2x₁ +  x₂ + 5x₃ =  15
```

Solución exacta `(2, 4, 3)`. Con tolerancia 0.001 % y `x⁽⁰⁾ = (0,0,0)`:
Gauss-Seidel converge en **8** iteraciones y Jacobi en **12**.
