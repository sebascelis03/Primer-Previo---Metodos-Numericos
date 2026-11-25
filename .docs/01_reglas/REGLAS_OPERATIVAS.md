# Reglas Operativas del Proyecto (Fuente Única de Verdad)

Este documento establece las **reglas permanentes e inquebrantables** de trabajo para cualquier iteración de desarrollo o mantenimiento del proyecto **Métodos Numéricos — FESC 2026-2**.

---

## 1. Planificación Obligatoria Previa
- **Prohibición de modificación directa:** Está estrictamente prohibido crear, editar o eliminar archivos de código o configuración sin antes redactar y presentar al usuario un **Plan de Implementación numerado** (`PLAN_XX_...md`).
- **Contenido obligatorio de todo Plan:**
  1. **Qué se hará:** Objetivo claro y alcance de la intervención.
  2. **Cómo está planteado:** Arquitectura, archivos afectados y decisiones técnicas.
  3. **Paso a paso de ejecución:** Secuencia numerada y verificable de acciones.
- **Aprobación explícita:** Ningún cambio se ejecuta hasta recibir la confirmación explícita del usuario.

---

## 2. Prohibición Absoluta de Comandos Git Automáticos
- **Cero ejecución de Git por el asistente:** Está estrictamente prohibido ejecutar cualquier comando de `git` (`git init`, `git add`, `git commit`, `git push`, `git checkout`, `git branch`, `git status`, `git log`, `git diff`, etc.) desde la terminal automatizada.
- **Entrega manual de comandos:** Siempre que se requiera control de versiones o consultas de estado en Git, el asistente debe redactar los comandos exactos en un bloque de código para que el usuario los ejecute manualmente en su propia terminal y confirme el resultado.

---

## 3. Política de Compactación y Orden Documental (`.docs/`)
- **Fuente Única de Verdad:** Toda la documentación del proyecto vive exclusivamente dentro de la carpeta raíz `.docs/`, organizada estrictamente en 6 subcarpetas temáticas:
  1. `.docs/01_reglas/` → `REGLAS_OPERATIVAS.md`
  2. `.docs/02_idea_general/` → `DOCUMENTO_MAESTRO.md`
  3. `.docs/03_referencia_ui_diseno/` → `GUIA_UI_DISENO.md`
  4. `.docs/04_toma_de_decisiones/` → `BITACORA_DECISIONES.md`
  5. `.docs/05_tareas_pendientes/` → `01_TAREAS_REALIZADAS.md`, `02_TAREA_ACTIVA.md`, `03_TAREAS_FUTURAS.md`
  6. `.docs/06_planes_implementacion/` → `PLAN_01_...md`, `PLAN_02_...md`, etc.
- **Compactación periódica:** Cuando el usuario lo indique explícitamente, los planes de implementación antiguos o ya superados en `.docs/06_planes_implementacion/` deberán compactarse en un único archivo Markdown histórico (`HISTORIAL_PLANES_COMPACTADOS.md`) para evitar acumulación y desorden.
