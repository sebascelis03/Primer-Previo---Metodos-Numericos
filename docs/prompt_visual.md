# Prompt Visual para Claude Code

> Copiar todo el contenido debajo de la línea y pegarlo en Claude Code.

---

Necesito una mejora visual completa de la aplicación. NO toques la lógica matemática (`numericalMethods.js`), solo la estética. Los cambios son los siguientes:

## 1. Dark Mode completo

Transforma toda la aplicación a un tema oscuro profesional:

- **Body**: Fondo `slate-950` con gradientes sutiles decorativos (un halo de color indigo con opacidad baja en la esquina superior izquierda y uno cyan/teal en la inferior derecha, usando `radial-gradient`).
- **Cards**: Reemplaza el `bg-white/90 border-slate-200` actual por un estilo glassmorphism: `bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg`. Que se sientan flotando sobre el fondo oscuro.
- **Textos**: Adapta toda la jerarquía de texto — títulos en `white` o `slate-100`, cuerpo en `slate-300`, textos secundarios en `slate-400/500`, labels en `slate-400`.
- **Inputs (matrix-cell, field-input)**: Fondo `slate-800/60`, borde `slate-700`, texto `slate-100`, placeholder `slate-500`. Al enfocar, borde `indigo-500` con `ring-indigo-500/20`.
- **Inputs inválidos**: Borde `rose-500/60`, fondo `rose-950/30`.

## 2. Nueva paleta de colores de acento

Reemplaza los colores genéricos para darle identidad:

- **Jacobi**: Cambia de `blue` a `indigo` (indigo-500, indigo-400, indigo-600). Aplica esto en el botón de Jacobi, el header de su tabla de resultados, y su `StatColumn` en el DuelCard.
- **Gauss-Seidel**: Cambia de `emerald` a `cyan` (cyan-500, cyan-400, cyan-600). Aplica en su botón, header de tabla y StatColumn.
- **Botón Modo Duelo**: Hazlo con un gradiente que mezcle ambos colores: `bg-gradient-to-r from-indigo-600 to-cyan-600`.
- **Diagonal de la matriz (i === j)**: Cambia `border-blue-300 bg-blue-50/60` por algo que funcione en dark: `border-indigo-500/40 bg-indigo-500/10`.
- **Vector b (columna extra)**: Cambia `border-emerald-300 bg-emerald-50/60` por `border-cyan-500/40 bg-cyan-500/10`.

## 3. Botones con gradientes

Aplica gradientes sutiles a los botones de acción principales:

- **Jacobi**: `bg-gradient-to-r from-indigo-600 to-indigo-500` con hover `from-indigo-500 to-indigo-400` y `shadow-lg shadow-indigo-500/25` en hover.
- **Gauss-Seidel**: `bg-gradient-to-r from-cyan-600 to-cyan-500` con hover similar y `shadow-lg shadow-cyan-500/25`.
- **Modo Duelo**: `bg-gradient-to-r from-indigo-600 to-cyan-600` con shadow mezclada.
- **Botones secundarios (Cargar ejemplo, Limpiar)**: `bg-white/5 border-white/10 text-slate-300 hover:bg-white/10`.

## 4. Corchetes matemáticos en la matriz

Agrega bordes CSS que simulen los corchetes `[` y `]` alrededor de la matriz 3x3 y alrededor del vector b. Usa pseudo-elementos `::before` y `::after` o bordes estilizados (border-left + border-top + border-bottom en el lado izquierdo, border-right + border-top + border-bottom en el derecho) en el contenedor de la cuadrícula. El color de los corchetes debe ser `slate-500` con grosor de 2px. Esto le da un toque académico/matemático genuino que distingue la app de un template genérico.

## 5. Header más impactante

- El título "Métodos Iterativos 3×3" debe usar un gradiente de texto: `bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent`. Hazlo más grande (`text-2xl sm:text-3xl`).
- El ícono del cuadrado (Grid3x3) debe tener fondo con gradiente `from-indigo-600 to-cyan-600` y el ícono en blanco.
- Agrega una línea debajo del subtítulo que diga: `FESC · Ingeniería de Software · 2026-2` en `text-xs text-slate-500 tracking-widest uppercase`.
- **Elimina** el badge "100% local" con el ícono WifiOff (quita también la importación de WifiOff de lucide-react si ya no se usa).
- **Agrega un menú hamburguesa** en esa posición (esquina derecha del header). Usa el ícono `Menu` de lucide-react (y `X` para cerrar). Al hacer clic, abre un panel/dropdown con animación fade-in que muestre:

```
Equipo
• Andres Esteban Sandoval Carreño
• Jhoan Sebastian Celis Pabon
• Zharick Nicoll Acevedo Ascanio

Métodos Numéricos · Primer Previo · 2026-2
```

El panel debe cerrarse al hacer clic fuera de él o al presionar el botón otra vez. Estilízalo con el mismo glassmorphism de las cards (`bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`). Maneja el estado abierto/cerrado con useState en App.jsx.

## 6. Dominance Card adaptada al dark mode

- **OK (verde)**: `border-emerald-500/20 bg-emerald-500/10`, badge `bg-emerald-500`, textos `emerald-300/400`.
- **Warning (ámbar)**: `border-amber-500/20 bg-amber-500/10`, badge `bg-amber-500`, textos `amber-300/400`.
- **Error (rojo)**: `border-rose-500/20 bg-rose-500/10`, badge `bg-rose-500`, textos `rose-300/400`.
- Los items del detalle fila por fila: `bg-white/5` en vez de `bg-white/70`.

## 7. Tabla de resultados adaptada

- Header de columnas (`thead`): `bg-slate-800/95` con texto `slate-400`.
- Filas: `odd:bg-white/[0.02] even:bg-transparent hover:bg-white/5`.
- La fila de convergencia (`isConverged`): `bg-emerald-500/10` con un borde izquierdo `border-l-2 border-emerald-400`.
- Textos de la tabla: `text-slate-200` para los valores, colores de error según magnitud adaptados al dark mode.
- El footer de "Solución aproximada": cards de cada variable con `bg-white/5 border-white/10`.

## 8. DuelCard adaptado

- Header: Mantén el fondo oscuro `bg-slate-900` pero agrega un borde sutil de gradiente.
- StatColumns: ganador con `ring-2 ring-amber-400/50 bg-amber-400/5`, perdedor con `bg-white/5`.
- Barras de progreso: fondo `bg-slate-700`, barras con los nuevos colores (indigo y cyan).
- Veredicto: `bg-white/5 border-white/10`.

## 9. EmptyState adaptado

- Cards de fórmulas: `bg-indigo-500/10 border-indigo-500/20` para Jacobi, `bg-cyan-500/10 border-cyan-500/20` para Gauss-Seidel.
- Card de criterio de parada: `bg-white/5 border-white/10`.
- Textos adaptados al dark mode.

## 10. Animaciones mejoradas

- Las barras de progreso del DuelCard deben animarse de ancho 0 al ancho final con `transition-all duration-1000 ease-out`.
- La fila de convergencia en la tabla de resultados debe tener una animación de pulso sutil al aparecer.

## Reglas importantes

- **NO modifiques** `numericalMethods.js` ni la lógica de ningún componente. Solo estilos y clases de Tailwind.
- Asegúrate de que los colores de error en la tabla (`errorTone` en `ResultsTable.jsx`) se adapten al dark mode: `text-emerald-400` para convergido, `text-amber-400` para error medio, `text-rose-400` para divergencia, `text-slate-500` para null.
- Mantén la responsividad existente (una columna en móvil, dos en `lg:`).
- Después de aplicar todos los cambios, verifica que no haya errores de consola y que todo se vea coherente.
