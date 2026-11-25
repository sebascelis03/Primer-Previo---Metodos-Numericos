# Guía de Referencia UI y Diseño Visual

Este documento consolida la identidad visual, paleta cromática, tipografía y patrones de componentes que rigen toda la interfaz del proyecto.

---

## 1. Concepto Estético: Dark Mode Académico + Glassmorphism
- **Fondo Principal (`body`):** Tema oscuro profundo basado en `slate-950` (`#020617`) enriquecido con halos de luz decorativos (`radial-gradient`) en tonos **Indigo** (esquina superior izquierda) y **Cyan** (esquina inferior derecha) de baja opacidad.
- **Superficies y Tarjetas (`.card`):** Efecto *glassmorphism* flotante:
  - `bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg`
- **Jerarquía de Texto:**
  - Títulos principales: `text-white` / `text-slate-100` o texto con gradiente `bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent`.
  - Cuerpo de lectura: `text-slate-200` / `text-slate-300`.
  - Etiquetas y metadatos secundarios: `text-slate-400` / `text-slate-500`.

---

## 2. Paleta Semántica de Colores

| Rol / Método | Color Base Tailwind | Uso en la Interfaz |
| :--- | :--- | :--- |
| **Jacobi / Punto Fijo / Primario** | `indigo-500` / `indigo-400` | Botón Jacobi, diagonal principal $a_{ii}$ de la matriz, pestañas y acentos primarios. |
| **Gauss-Seidel / Newton-Raphson / Raíz Real** | `cyan-500` / `cyan-400` | Botón Gauss-Seidel, vector $b$, badges de raíces reales en Bairstow. |
| **Modo Duelo / Acción Global** | Gradiente `from-indigo-600 to-cyan-600` | Selector de Previo activo, botón Modo Duelo, ícono Hero del Header. |
| **Bairstow / Raíces Complejas** | `purple-500` / `purple-300` | Badges de raíces complejas conjugadas ($a \pm bi$) y acentos de polinomios. |
| **Convergencia / Éxito** | `emerald-500` / `emerald-400` | Fila final de convergencia en tablas, tarjeta de dominancia cumplida, solución hallada. |
| **Advertencia / Condición Parcial** | `amber-500` / `amber-400` | No cumplimiento de dominancia diagonal estricta, límite de iteraciones alcanzado, corona del ganador en Duelo. |
| **Divergencia / Error de Sintaxis** | `rose-500` / `rose-400` | Cero en diagonal, división por cero, sintaxis inválida en funciones, divergencia numérica. |

---

## 3. Tipografía y Notación Matemática
- **UI General:** Fuente sans-serif limpia (`Inter`, sistema).
- **Datos Numéricos, Matrices, Tablas y Fórmulas (`font-mono`):** `JetBrains Mono` / monoespaciada con `tabular-nums` para alineación vertical perfecta de decimales y signos negativos en tablas de iteraciones.

---

## 4. Componentes Clave y Reglas de Layout

### 4.1 Hero Header Institucional (`App.jsx`)
- Layout vertical centrado (`flex-col items-center text-center py-8 sm:py-12`).
- Halo decorativo trasero (`blur-3xl opacity-20 bg-indigo-500`).
- Ícono principal grande (`size-16 sm:size-20 rounded-3xl`) con gradiente `from-indigo-600 to-cyan-600`.
- Título dramático (`text-3xl sm:text-5xl font-black`) y subtítulo dinámico según el Previo seleccionado.
- Badge institucional en mayúsculas con alto tracking: `FESC · INGENIERÍA DE SOFTWARE · 2026-2`.
- **Menú Hamburguesa del Equipo:** Ubicado en la esquina superior derecha (`absolute top-4 right-0`), despliega una tarjeta glassmorphism con los integrantes del equipo y cierra al hacer clic fuera.
- **Selector de Previos (Segmented Control):** Píldoras centradas para alternar entre **Previo 1** y **Previo 2**.

### 4.2 Inputs y Matrices (`.matrix-cell`, `.field-input`)
- Fondo `bg-slate-800/60`, borde `border-slate-700`, texto `text-slate-100`, foco con anillo `focus:border-indigo-500 focus:ring-indigo-500/20`.
- **Corchetes Matemáticos:** La matriz $3\times3$ y el vector $b$ están enmarcados por bordes estilizados de `2px` en color `slate-500` que simulan corchetes algebraicos `[ ]`.

### 4.3 Tablas de Iteraciones
- Cabecera fija (`sticky top-0 bg-slate-800/95 text-slate-400`).
- Filas cebradas sutiles (`odd:bg-white/[0.02] hover:bg-white/5`).
- Fila de convergencia (`isConverged`): resaltada con `bg-emerald-500/10 border-l-2 border-emerald-400` y animación de pulso suave.
- Scrollbar delgada personalizada (`.scrollbar-slim`).

### 4.4 Responsividad y Estados Vacíos
- **Diseño Responsivo:** 1 columna fluida en móviles; 2 columnas asimétricas en escritorio (`lg:grid-cols-12`, panel de entrada a la izquierda y resultados a la derecha).
- **Estados Vacíos Pedagógicos (`EmptyState`):** Antes de ejecutar un cálculo, el panel derecho muestra las fórmulas matemáticas del método y el criterio de parada $\varepsilon_a \le \text{tol}$.
