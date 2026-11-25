# PLAN DE IMPLEMENTACIÓN #4: Modo Aprendizaje Paso a Paso por Iteración + Despejes y Reordenamiento en Previo 1

- **Estado:** Aprobado y Ejecutado
- **Fecha:** 24 de noviembre de 2026

## 1. Qué se hizo
1. **Previo 1 — Reordenamiento Automático de Filas y Despejes Explícitos (`numericalMethods.js`, `DominanceCard.jsx`, `Previo1View.jsx`):**
   - `findBestRowPermutation(A)` evalúa las 6 permutaciones posibles de las 3 ecuaciones y habilita un botón de un clic para reordenar las filas y lograr dominancia diagonal estricta (o eliminar ceros en la diagonal).
   - Botón desplegable *"Ver fórmulas despejadas"* en `DominanceCard` que muestra las 3 ecuaciones despejadas $x_1, x_2, x_3$ con los coeficientes actuales.
2. **Previo 1 — Desarrollo Paso a Paso al Hacer Clic en Cualquier Iteración $k \ge 1$ (`ResultsTable.jsx`):**
   - Al hacer clic en una fila $k$, se despliega el reemplazo numérico en las 3 ecuaciones despejadas y el cálculo de $\varepsilon(x_1), \varepsilon(x_2), \varepsilon(x_3)$, diferenciando con colores en Gauss-Seidel qué valores provienen de la iteración anterior ($k-1$, índigo) y cuáles fueron recién calculados en la misma iteración ($k$, cyan).
3. **Previo 2 — Desarrollo Paso a Paso al Hacer Clic en Cualquier Iteración $k$:**
   - **Punto Fijo (`SequentialIterativeCalculator.jsx`):** Muestra la evaluación $x_{k+1} = g(x_k)$, $\Delta x$ y la fórmula del error relativo $\varepsilon_a$.
   - **Newton-Raphson (`NewtonRaphsonCalculator.jsx`):** Muestra los valores evaluados $f(x_k)$ y $f'(x_k)$, la sustitución en la fórmula de la tangente y el error relativo $\varepsilon_a$.
   - **Bairstow (`BairstowCalculator.jsx`, `nonlinearMethods.js`):** Muestra los coeficientes $b_n \dots b_0$ y $c_n \dots c_1$ de la doble división sintética, el sistema $2\times2$ armado con números, el determinante $D = c_2^2 - c_1 c_3$ y la actualización de $r, s$ con sus errores $\varepsilon_r, \varepsilon_s$.
