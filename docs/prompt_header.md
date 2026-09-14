# Prompt Header — Mejora para Claude Code

> Copiar todo el contenido debajo de la línea y pegarlo en Claude Code.

---

El header actual se ve muy plano y compacto, como una barra de navegación genérica. Necesito que se convierta en una sección "hero" que sea lo primero que impresione al ver la app. Este es un proyecto universitario y el header es lo que el profesor ve primero. Hazlo memorable.

## Cambios en el Header (`App.jsx`, sección `<header>`)

### Estructura y tamaño
- Aumenta el padding vertical del header significativamente: de `mb-6 sm:mb-8` a algo como `py-8 sm:py-12 mb-8 sm:mb-10`.
- Centra todo el contenido del header horizontalmente (`text-center`), no lo dejes alineado a la izquierda.
- El layout debe ser vertical (flex-col), no horizontal: ícono arriba, título debajo, subtítulo debajo, línea FESC debajo.

### Ícono principal
- Hazlo mucho más grande: `size-16 sm:size-20` en vez de `size-11`.
- El ícono interior también más grande: `size-8 sm:size-10`.
- Dale un fondo con gradiente animado o un anillo/glow sutil: un `ring-2 ring-indigo-400/30` o un `shadow-lg shadow-indigo-500/20` para que "brille" suavemente.
- Redondeo más pronunciado: `rounded-3xl`.

### Título
- Hazlo mucho más grande y dramático: `text-3xl sm:text-5xl font-black`.
- El gradiente de texto que ya tiene (`from-indigo-400 to-cyan-400`) está bien, mantenlo.
- El "3×3" puede ser un color sólido distinto para que resalte (por ejemplo `text-cyan-400` sin gradiente, o al revés).

### Subtítulo
- "Sistemas de ecuaciones lineales por Jacobi y Gauss-Seidel" → `text-base sm:text-lg text-slate-400 mt-2 max-w-lg mx-auto`.
- Que se sienta como una descripción, no como un label pegado al título.

### Línea institucional
- "FESC · INGENIERÍA DE SOFTWARE · 2026-2" → `text-xs text-slate-500 tracking-[0.25em] uppercase mt-3`.
- Opcionalmente, ponla dentro de un chip/badge sutil con borde: `border border-white/10 rounded-full px-4 py-1.5 inline-block`.

### Separador inferior
- Agrega un separador visual entre el header y el contenido. Puede ser:
  - Una línea horizontal con gradiente: un `<div>` con `h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent` como último hijo del header.
  - O simplemente un `border-b border-white/5`.

### Botón hamburguesa
- Posiciónalo en la esquina superior derecha del header de forma **absoluta** (`absolute top-4 right-0` con el header `relative`), para que no rompa el centrado del contenido.
- Dale un poco más de presencia: `size-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition`.
- El ícono `Menu`/`X` en `text-slate-300`.

### Efecto decorativo (opcional pero muy impactante)
- Detrás del header, agrega un halo/glow decorativo sutil: un `<div>` con posición absoluta, `rounded-full blur-3xl opacity-20 bg-indigo-500 w-64 h-64` centrado detrás del ícono. Esto crea un efecto de "luz" detrás del ícono que se ve muy premium en dark mode. Dale `pointer-events-none` y `z-0` para que no interfiera.

## Reglas
- NO toques nada fuera del header (no toques componentes, no toques numericalMethods.js).
- Mantén el menú hamburguesa funcional (el useState, el dropdown con los integrantes del equipo).
- Asegúrate de que se vea bien tanto en móvil como en escritorio.
- Después de los cambios, verifica que no haya errores de consola.
