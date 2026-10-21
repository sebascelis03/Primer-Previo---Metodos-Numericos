# Prompt Previo 2 para Claude Code

> Copiar todo el contenido debajo de la línea divisoria y pegarlo directamente en Claude Code.

---

Necesito implementar una nueva vista llamada **"Previo 2"** y organizar la aplicación para que la vista actual pase a llamarse **"Previo 1"**. La nueva vista contendrá **3 calculadoras de métodos numéricos para raíces y ecuaciones no lineales**:
1. **Iterativo Secuencial (Punto Fijo / Sustitución Sucesiva)**
2. **Método de Newton-Raphson**
3. **Método de Bairstow (Raíces reales y complejas de polinomios)**

Conserva intacto el funcionamiento de Previo 1 (sistemas lineales 3×3 por Jacobi y Gauss-Seidel) y mantén la misma estética premium (Dark Mode, Glassmorphism, Tailwind CSS v4, Lucide Icons, tipografía JetBrains Mono para números y notación matemática).

---

## 1. Navegación Global (Header y Selector de Previos)

1. En el encabezado (`App.jsx`), agrega un **selector de pestañas superior tipo segmented control** o pills:
   - **`[ Previo 1 ]`**: Sistemas de Ecuaciones Lineales 3×3 (Jacobi y Gauss-Seidel).
   - **`[ Previo 2 ]`**: Raíces de Ecuaciones No Lineales y Polinomios.
2. La pestaña activa debe destacarse con gradiente `from-indigo-600 to-cyan-600`, texto blanco y sombra sutil; la inactiva en `text-slate-400 hover:text-slate-200 bg-white/5`.
3. El título y subtítulo dinámico del Hero se adapta al previo activo:
   - En **Previo 1**: "Métodos Iterativos 3×3" · "Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel".
   - En **Previo 2**: "Ecuaciones No Lineales y Polinomios" · "Iterativo Secuencial, Newton-Raphson y Método de Bairstow".
4. Mantén intacto el botón hamburguesa con el menú del equipo de estudiantes de la FESC.

---

## 2. Motor Matemático y Evaluador (`src/utils/`)

Crea dos módulos con funciones puras y tipadas con JSDoc:

### A. Evaluador Matemático Seguro (`src/utils/mathEvaluator.js`)
- Un parser matemático ligero y seguro en JavaScript (sin usar `eval()` inseguro).
- Soporte para la variable `x` en minúscula o mayúscula.
- Soporte de operadores aritméticos estándar (`+`, `-`, `*`, `/`, `^` para potencias).
- Soporte para multiplicación implícita (ej. `2x` -> `2*x`, `3(x+1)` -> `3*(x+1)`, `x(x-1)`).
- Funciones matemáticas estándar: `sin`, `cos`, `tan`, `exp`, `ln`/`log`, `sqrt`, `abs`.
- Constantes: `pi` (o `PI`), `e` (o `E`).
- Debe retornar un valor numérico finito o lanzar un error descriptivo si la sintaxis es inválida o hay división entre cero / logaritmo de número no positivo.

### B. Métodos No Lineales (`src/utils/nonlinearMethods.js`)

Implementa y exporta las siguientes funciones (todas redondeando en presentación a 6 decimales pero manteniendo precisión flotante en cálculos internos):

1. **`solveFixedPoint({ gExpr, x0, tol, maxIter })`**:
   - Fórmula: $x_{k+1} = g(x_k)$.
   - Error relativo porcentual: $\varepsilon_a = \left|\frac{x_{k+1} - x_k}{x_{k+1}}\right| \times 100$ (si $x_{k+1} = 0$, usar error absoluto $\times 100$).
   - Criterio de parada: $\varepsilon_a \le \text{tol}$ o $k \ge \text{maxIter}$.
   - Detección de divergencia: si $|x_{k+1}| > 10^{12}$ o produce `NaN`/`Infinity`.
   - Retorna: `{ history: [{ k, xk, gxk, error }], converged: boolean, root: number, iterations: number, message: string }`.

2. **`solveNewtonRaphson({ fExpr, dfExpr, useAutoDerivative, x0, tol, maxIter })`**:
   - Fórmula: $x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}$.
   - Si `useAutoDerivative` es true o `dfExpr` está vacío, calcula $f'(x_k)$ mediante diferencias finitas centrales: $f'(x) \approx \frac{f(x+h) - f(x-h)}{2h}$ con $h = 10^{-6}$.
   - Detección de derivada nula: si $|f'(x_k)| < 10^{-12}$, detener con advertencia clara de "tangente horizontal / división por cero".
   - Retorna: `{ history: [{ k, xk, fxk, dfxk, xnext, error }], converged: boolean, root: number, residual: number, iterations: number, message: string }`.

3. **`solveBairstow({ coefficients, r0, s0, tol, maxIter })`**:
   - Polinomio: $P(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_1 x + a_0$.
   - Algoritmo completo de Bairstow para extraer factores cuadráticos $x^2 - r x - s$:
     - Doble división sintética para obtener arrays $b$ y $c$.
     - Sistema $2\times2$ para $\Delta r$ y $\Delta s$:
       $$c_2 \Delta r + c_3 \Delta s = -b_1$$
       $$c_1 \Delta r + c_2 \Delta s = -b_0$$
     - Determinante $D = c_2^2 - c_1 c_3$. Si $|D| < 10^{-14}$, manejar singularidad.
     - Actualización: $r \leftarrow r + \Delta r$, $s \leftarrow s + \Delta s$.
     - Errores relativos: $\varepsilon_r = |\Delta r / r| \cdot 100$, $\varepsilon_s = |\Delta s / s| \cdot 100$.
     - Raíces del trinomio $x^2 - rx - s$:
       $$D_q = r^2 + 4s$$
       Si $D_q \ge 0$: dos raíces reales $\frac{r \pm \sqrt{D_q}}{2}$.
       Si $D_q < 0$: dos raíces complejas conjugadas $\frac{r}{2} \pm \frac{\sqrt{|D_q|}}{2} i$.
     - Deflación polinomial sucesiva hasta llegar a grado 2 o grado 1.
   - Retorna: `{ factors: [{ factorIndex, iterationsHistory, r, s, roots }], allRoots: [{ real, imag, isComplex, label }], converged: boolean, message: string }`.

---

## 3. Componentes de la Vista Previo 2 (`src/components/previo2/`)

Crea la siguiente estructura modular:

### A. `Previo2View.jsx`
- Barra de pestañas secundarias con 3 opciones:
  - 🔄 **Iterativo Secuencial**
  - ⚡ **Newton-Raphson**
  - 🧬 **Método de Bairstow**
- Renderiza la calculadora activa con animaciones suaves de entrada (`animate-rise`).

### B. `SequentialIterativeCalculator.jsx`
- **Panel de Entrada**:
  - Campo de texto para $g(x)$ con ejemplos de ayuda (ej. `(cos(x) + 1)/2`, `exp(-x)`, `(x^2 + 2)/3`).
  - Campo $x_0$ (valor inicial).
  - Tolerancia (default `0.001`) y máx iteraciones (default `50`).
  - Botones con gradientes: **"Calcular Raíz"**, **"Cargar Ejemplo"**, **"Limpiar"**.
  - Ejemplo precargado académico listo para probar: $g(x) = \frac{e^{-x} + x}{2}$ o $g(x) = \sqrt{\frac{x + 5}{2}}$ con $x_0 = 1.5$.
- **Panel de Resultados**:
  - Tarjeta de convergencia destacada (verde esmeralda si converge, ámbar/rojo si diverge) con la raíz aproximada $x^*$.
  - Comprobación: valor evaluado $g(x^*) \approx x^*$.
  - Tabla de iteraciones interactiva con columnas: $k$, $x_k$, $g(x_k) = x_{k+1}$, $\Delta x$, Error Relativo %. La fila final de convergencia debe resaltarse con fondo esmeralda y pulso visual.

### C. `NewtonRaphsonCalculator.jsx`
- **Panel de Entrada**:
  - Campo para $f(x)$ (ej. `x^3 - 2*x - 5`).
  - Switch/Toggle: *"Calcular derivada automáticamente"* vs *"Ingresar f'(x) manualmente"*.
  - Campo condicional para $f'(x)$ si el toggle es manual.
  - Campo $x_0$, tolerancia y máx iteraciones.
  - Botón **"Cargar Ejemplo"** (ej. $f(x) = x^3 - 2x - 5, x_0 = 2$).
- **Panel de Resultados**:
  - Tarjeta con la raíz hallada y el residual $f(x^*) \approx 0$.
  - Tabla de iteraciones: $k$, $x_k$, $f(x_k)$, $f'(x_k)$, $x_{k+1}$, Error %.

### D. `BairstowCalculator.jsx`
- **Panel de Entrada**:
  - Selector interactivo de Grado del Polinomio ($n = 2, 3, 4, 5$).
  - Inputs ordenados para cada coeficiente $a_n, a_{n-1}, \dots, a_0$ con badges que indiquen la potencia ($x^4, x^3, x^2, x^1, x^0$).
  - Vista previa en tiempo real de la ecuación polinomial formateada (ej. $P(x) = x^4 - 3.5x^3 + 2.75x^2 + 2.125x - 3.875$).
  - Campos para valores iniciales $r_0$ (default `0`) y $s_0$ (default `0`).
  - Tolerancia y máx iteraciones.
  - Botón **"Cargar Ejemplo"**: Polinomio de grado 4 clásico de Chapra con raíces reales y complejas:
    $$P(x) = x^4 - 3.5x^3 + 2.75x^2 + 2.125x - 3.875$$
    o $P(x) = x^3 - 4x^2 + 5x - 2$.
- **Panel de Resultados**:
  - **Tarjeta de Raíces Encontradas**: Lista visual de todas las raíces $x_1, x_2, \dots, x_n$. Las raíces complejas deben mostrarse con formato claro $a \pm b\,i$ resaltadas con un badge violeta (`bg-purple-500/10 border-purple-500/30 text-purple-300`) y las reales con badge cyan (`bg-cyan-500/10 border-cyan-500/30 text-cyan-300`).
  - **Factores Cuadráticos Extraídos**: Detalle de cada factor $x^2 - rx - s$ y su tabla de iteraciones de convergencia de $r$ y $s$.

---

## 4. Estilos y Experiencia Visual

- Todos los componentes deben respetar la clase `.card` (`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl`).
- Las tablas deben usar `.scrollbar-slim`, cabecera `bg-slate-800/95 sticky top-0`, fuentes monoespaciadas para números (`font-mono text-xs sm:text-sm`).
- En móvil: layout vertical fluido sin desbordamientos horizontales. En escritorio (`lg:`): dos columnas (inputs a la izquierda sticky, resultados a la derecha).
- Cada calculadora debe tener su estado vacío pedagógico (`EmptyState`) cuando aún no se ha presionado "Calcular", explicando brevemente el algoritmo y sus fórmulas.

---

## 5. Reglas de Validación y Calidad
1. No romper ninguna función existente de Previo 1 (mantener la matriz 3×3, Jacobi, Gauss-Seidel, modo duelo y dominancia diagonal intactos).
2. Manejo robusto de entradas: avisar con mensajes amigables en rojo si hay sintaxis incorrecta o campos vacíos.
3. Asegurar que al ejecutar `npm run build` o `npm run dev` no existan errores ni advertencias de variables sin usar.
