# PLAN DE IMPLEMENTACIÓN #2: Teclado Matemático Visual (GeoGebra / Photomath) y Vista Previa en Tiempo Real

- **Estado:** Aprobado y ejecutado (`npm run build` sin errores). Se agregó además `src/components/previo2/mathEditing.js`.
- **Fecha:** 24 de noviembre de 2026

---

## 1. Qué se hará
Reemplazar la entrada de texto plano incómoda en `Previo 2` (usada en **Iterativo Secuencial** `g(x)` y **Newton-Raphson** `f(x)` y `f'(x)`) por una experiencia de escritorio tipo **GeoGebra / Photomath** compuesta por:
1. **Vista Previa Matemática en Tiempo Real (AST → Renderizado Visual 2D):** Convierte la expresión que el usuario escribe en notación matemática real con **fracciones apiladas** ($\frac{a}{b}$), **radicales con barra superior vinculada** ($\sqrt{\dots}$ y $\sqrt[n]{\dots}$), **exponentes elevados** ($x^n$, $e^x$), funciones trigonométricas/logarítmicas y constantes ($\pi, e$), sin requerir dependencias externas ni conexión a internet (100% compatible con la PWA offline).
2. **Teclado / Panel Visual de Funciones para Escritorio (`MathKeypad.jsx`):** Panel interactivo organizado en 3 grupos claros (*Básicos, Potencias y Raíces*, *Exponenciales, Logaritmos y Constantes*, *Trigonométricas*), con inserción inteligente en la posición exacta del cursor (`selectionStart` / `selectionEnd`), envolviendo texto seleccionado si lo hay y posicionando el cursor automáticamente dentro del paréntesis o exponente.
3. **Soporte de raíz n-ésima `root(n, x)` / `cbrt(x)` en `mathEvaluator.js`:** Ampliar de forma retrocompatible `mathEvaluator.js` para soportar raíz cúbica `cbrt(x)` y raíces enésimas mientras conserva intactas todas las funciones actuales.

---

## 2. Cómo está planteado (Archivos a Crear o Modificar)

1. **`src/utils/mathEvaluator.js` (Modificar - Retrocompatible):**
   - Añadir la función `cbrt` (`Math.cbrt`, admite radicandos negativos en raíces impares) y `nthRoot` / generador de AST ligero `parseToAST(expression)` para que el renderizador visual pueda dibujar fracciones, potencias y raíces exactas a partir de la misma gramática del evaluador.
2. **`src/components/previo2/MathPreview.jsx` (Crear):**
   - Renderizador matemático visual en React puro + CSS (`inline-flex` para fracciones verticales con barra divisoria, radicales SVG/CSS con barra superior `overline`, superíndices reales, símbolos $\pi, \cdot, \times$ y resaltado de funciones).
   - Si la expresión aún está incompleta mientras el usuario escribe, muestra el último árbol válido o una vista formateada elegante sin romper la pantalla.
3. **`src/components/previo2/MathKeypad.jsx` (Crear):**
   - Panel visual de escritorio desplegable/fijo con pestañas rápidas:
     - **Pestaña 1 — Álgebra, Potencias y Raíces:** `x`, `x²`, `x³`, `xⁿ`, `√(x)`, `³√(x)`, `ⁿ√(x)`, fracción `a/b` (`()/()`), `|x|`, `( )`, `+`, `−`, `×`, `÷`.
     - **Pestaña 2 — Exp, Log y Constantes:** `eˣ`, `10ˣ`, `ln(x)`, `log₁₀(x)`, `π`, `e`, números rápidos.
     - **Pestaña 3 — Trigonométricas:** `sin`, `cos`, `tan`, `asin` ($\sin^{-1}$), `acos` ($\cos^{-1}$), `atan` ($\tan^{-1}$), `sinh`, `cosh`, `tanh`.
   - Barra superior de utilidades del teclado: mover cursor (`←` / `→`), envolver en paréntesis, retroceso (`⌫`) y limpiar campo.
4. **`src/components/previo2/FormControls.jsx` (Modificar):**
   - Integrar `MathPreview` y `MathKeypad` dentro de `ExpressionField`, gestionando la referencia `inputRef` para insertar plantillas en la posición exacta del cursor y posicionar el cursor tras cada clic (`requestAnimationFrame` + `setSelectionRange`).
5. **`src/components/previo2/CalculatorLayout.jsx` y `src/index.css` (Modificar):**
   - Ampliar ligeramente la columna izquierda en escritorio (`lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]`) para que el teclado matemático y la vista previa de ecuaciones luzcan amplios y cómodos en monitor de computador, además de añadir las clases CSS para fracciones apiladas y radicales matemáticos.

---

## 3. Paso a Paso de Ejecución

1. **Paso 1:** Extender `src/utils/mathEvaluator.js` con `cbrt` y la función exportada `parseExpressionAST(expression)` que devuelve el árbol sintáctico estructurado (`number`, `variable`, `constant`, `unary`, `binary` con `+,-,*,/,^`, `call`) sin alterar `compileExpression` ni `checkExpression`.
2. **Paso 2:** Añadir en `src/index.css` los estilos matemáticos dedicados (`.math-frac`, `.math-num`, `.math-den`, `.math-sqrt`, `.math-radicand`, `.math-sup`) para representación tipográfica de nivel académico.
3. **Paso 3:** Crear `src/components/previo2/MathPreview.jsx` que consume `parseExpressionAST` y dibuja en tiempo real la ecuación con fracciones apiladas, raíces con vinculum (barra superior), potencias como superíndices reales y símbolos matemáticos ($\pi$, $e$, $\sin$, $\ln$, $|x|$).
4. **Paso 4:** Crear `src/components/previo2/MathKeypad.jsx` con diseño glassmorphism de escritorio, pestañas por categoría y botones con notación visual tipo GeoGebra/Photomath.
5. **Paso 5:** Actualizar `ExpressionField` en `src/components/previo2/FormControls.jsx` y el ancho de escritorio en `src/components/previo2/CalculatorLayout.jsx` para conectar la inserción en el cursor, el teclado desplegable/activo y la vista previa en vivo tanto en **Iterativo Secuencial** como en **Newton-Raphson** (`f(x)` y `f'(x)`).
6. **Paso 6:** Ejecutar `npm run build` en la terminal para verificar que no existan errores de compilación ni regresiones en Previo 1 ni Previo 2.
