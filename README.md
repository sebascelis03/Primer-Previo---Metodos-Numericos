# Métodos Iterativos 3×3 — Jacobi & Gauss-Seidel

PWA de funcionamiento estrictamente local para resolver sistemas de ecuaciones lineales de 3×3
mediante los métodos iterativos de **Jacobi** y **Gauss-Seidel**.

No realiza ninguna petición de red en tiempo de ejecución: todo el cálculo ocurre en el navegador
y el service worker precachea el shell completo para uso sin conexión.

## Stack

| Capa      | Tecnología                     |
| --------- | ------------------------------ |
| Frontend  | React 19 + Vite 7              |
| Estilos   | Tailwind CSS 4 (`@tailwindcss/vite`) |
| Iconos    | `lucide-react`                 |
| PWA       | `vite-plugin-pwa` (Workbox)    |

## Uso

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo -> http://localhost:5173
npm run build    # build de producción en dist/
npm run preview  # servir el build localmente (permite instalar la PWA)
```

> El service worker solo se activa sobre el build (`npm run build` + `npm run preview`),
> no en modo desarrollo.

## Estructura

```
src/
├── App.jsx                        Estado global (matriz, parámetros, resultados) con useState
├── main.jsx                       Punto de entrada + registro del service worker
├── index.css                      Tailwind, tokens de tema y clases de componente
├── components/
│   ├── MatrixInput.jsx            Matriz aumentada [A|b], parámetros y botones de acción
│   ├── DominanceCard.jsx          Alerta de dominancia diagonal (verde / ámbar / rojo)
│   ├── ResultsTable.jsx           Tabla k | x₁ | x₂ | x₃ | Error (%) + solución
│   ├── DuelCard.jsx               Modo Duelo: comparativa Jacobi vs. Gauss-Seidel
│   └── EmptyState.jsx             Recordatorio de fórmulas antes del primer cálculo
└── utils/
    └── numericalMethods.js        Motor matemático (funciones puras)
```

## Motor matemático (`src/utils/numericalMethods.js`)

Todas las funciones son puras: no mutan sus argumentos ni dependen de estado externo.

### `solveJacobi(A, b, x0, tolerance, maxIterations)`

### `solveGaussSeidel(A, b, x0, tolerance, maxIterations)`

| Parámetro       | Tipo         | Por defecto | Descripción                              |
| --------------- | ------------ | ----------- | ---------------------------------------- |
| `A`             | `number[][]` | —           | Matriz de coeficientes 3×3               |
| `b`             | `number[]`   | —           | Vector de términos independientes        |
| `x0`            | `number[]`   | `[0,0,0]`   | Vector inicial                           |
| `tolerance`     | `number`     | `0.001`     | Tolerancia sobre el error relativo **porcentual** |
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
