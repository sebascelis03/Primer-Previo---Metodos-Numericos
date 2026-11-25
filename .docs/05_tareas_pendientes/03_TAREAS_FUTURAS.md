# Tareas Futuras y Oportunidades de Mejora

Listado de hallazgos técnicos, mejoras pedagógicas y funcionalidades potenciales identificadas para futuras iteraciones (no se ejecutarán hasta que el usuario lo solicite y apruebe su respectivo Plan de Implementación).

---

## 1. Mejoras Pedagógicas y Visuales (Previo 1 y Previo 2)
- [ ] **Exportación / Impresión de Resultados a PDF:** Añadir un botón de impresión (`window.print()`) con hoja de estilos `@media print` optimizada para entregar reportes paso a paso en papel o PDF.
- [ ] **Visualización Explícita de Fórmulas de Despeje (Previo 1):** Mostrar dinámicamente las ecuaciones despejadas de $x_1, x_2, x_3$ con los coeficientes actuales ingresados por el usuario antes de la tabla de iteraciones.
- [ ] **Gráfica de Convergencia (Error % vs. Iteración $k$):** Incorporar un gráfico SVG ligero que trace la curva de caída del error relativo $\varepsilon_a$ respecto al umbral de tolerancia (especialmente útil en Modo Duelo para comparar Jacobi vs. Gauss-Seidel).
- [ ] **Comparación Opcional con Solución Analítica Exacta:** Permitir ingresar la solución exacta conocida para calcular el **error relativo verdadero** ($\varepsilon_t$) además del error aproximado ($\varepsilon_a$).
- [ ] **Reordenamiento Automático de Filas (Pivoteo para Dominancia Diagonal):** Ofrecer un botón opcional que intente permutar las filas de la matriz $3\times3$ cuando no se cumpla la dominancia diagonal estricta o exista un cero en la diagonal.

---

## 2. Calidad de Código e Infraestructura
- [ ] **Configuración de Suite de Pruebas Automatizadas (`npm test`):** Añadir un script de pruebas unitarias (por ejemplo, con el test runner nativo de Node `node --test` o Vitest) para validar de manera reproducible los motores `numericalMethods.js`, `nonlinearMethods.js` y `mathEvaluator.js`.
- [ ] **Consistencia de Rutas Base en `index.html`:** Verificar y alinear la referencia de `/src/main.jsx` con `base: './'` en `vite.config.js`.
