# PLAN DE IMPLEMENTACIÓN #1: Creación de la Estructura Documental `.docs/` (Fuente Única de Verdad)

- **Estado:** Aprobado y Ejecutado
- **Fecha:** 24 de noviembre de 2026

---

## 1. Qué se hará
Crear la estructura raíz `.docs/` con sus **6 subcarpetas temáticas obligatorias** y sus respectivos archivos Markdown base, consolidando en ellos el contexto real del proyecto (**Métodos Numéricos — FESC 2026-2**, Previo 1 y Previo 2) y migrando la información relevante que se encontraba dispersa en la carpeta antigua `docs/`.

---

## 2. Cómo está planteado (Arquitectura de Archivos)

```text
.docs/
├── 01_reglas/
│   └── REGLAS_OPERATIVAS.md
├── 02_idea_general/
│   └── DOCUMENTO_MAESTRO.md
├── 03_referencia_ui_diseno/
│   └── GUIA_UI_DISENO.md
├── 04_toma_de_decisiones/
│   └── BITACORA_DECISIONES.md
├── 05_tareas_pendientes/
│   ├── 01_TAREAS_REALIZADAS.md
│   ├── 02_TAREA_ACTIVA.md
│   └── 03_TAREAS_FUTURAS.md
└── 06_planes_implementacion/
    └── PLAN_01_ESTRUCTURA_DOCUMENTAL.md
```

---

## 3. Paso a Paso de Ejecución

1. **Paso 1 — Crear `.docs/01_reglas/REGLAS_OPERATIVAS.md`:** Documentar las 3 reglas permanentes (planificación previa numerada con aprobación explícita, prohibición absoluta de ejecutar comandos `git` automáticamente, y política de orden y compactación en `.docs/`).
2. **Paso 2 — Crear `.docs/02_idea_general/DOCUMENTO_MAESTRO.md`:** Documentar la definición del proyecto, integrantes del equipo FESC, alcance funcional de Previo 1 y Previo 2, stack tecnológico y arquitectura de carpetas `src/`.
3. **Paso 3 — Crear `.docs/03_referencia_ui_diseno/GUIA_UI_DISENO.md`:** Consolidar la guía estética Dark Mode (`slate-950`), glassmorphism, paleta semántica por método, tipografía monoespaciada y estructura del Hero Header.
4. **Paso 4 — Crear `.docs/04_toma_de_decisiones/BITACORA_DECISIONES.md`:** Registrar cronológicamente los 4 hitos del proyecto (Previo 1, Rediseño Dark Mode/Header, Previo 2 y adopción de `.docs/`).
5. **Paso 5 — Crear los 3 archivos en `.docs/05_tareas_pendientes/`:**
   - `01_TAREAS_REALIZADAS.md`
   - `02_TAREA_ACTIVA.md`
   - `03_TAREAS_FUTURAS.md`
6. **Paso 6 — Crear `.docs/06_planes_implementacion/PLAN_01_ESTRUCTURA_DOCUMENTAL.md`:** Almacenar este plan como registro formal.
7. **Paso 7 — Eliminar la carpeta antigua `docs/`:** Retirar la carpeta `docs/` tras haber absorbido su contenido en `.docs/` para mantener una única fuente de verdad documental.
