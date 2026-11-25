# Tareas Realizadas

Resumen simplificado de los hitos y módulos completados hasta la fecha en el proyecto.

---

- [x] **Módulo Previo 1 — Motor y UI de Sistemas Lineales 3×3:**
  - Implementación de métodos iterativos de **Jacobi** y **Gauss-Seidel** con redondeo a 6 cifras decimales y precisión interna completa.
  - Verificación de **dominancia diagonal estricta** fila por fila y detección de ceros en la diagonal.
  - Cálculo del **vector residual** $r = b - A \cdot x$ y **Modo Duelo** comparativo.
- [x] **Configuración PWA Offline:**
  - Integración de `vite-plugin-pwa` con manifiesto, íconos y service worker para funcionamiento 100% local sin conexión.
- [x] **Rediseño Visual Dark Mode & Hero Header:**
  - Aplicación de tema oscuro (`slate-950`), tarjetas glassmorphism, paleta Indigo/Cyan, corchetes matemáticos en matriz y Hero Header con menú hamburguesa del equipo FESC.
- [x] **Módulo Previo 2 — Ecuaciones No Lineales y Polinomios:**
  - Creación del evaluador matemático seguro por descenso recursivo (`src/utils/mathEvaluator.js`) sin `eval()`.
  - Implementación de las 3 calculadoras en `src/components/previo2/` y `src/utils/nonlinearMethods.js`:
    1. **Iterativo Secuencial (Punto Fijo)**
    2. **Método de Newton-Raphson** (con derivada automática o manual)
    3. **Método de Bairstow** (raíces reales y complejas para polinomios de grado 2 a 5)
- [x] **PLAN_01 — Estructura Documental `.docs/` (Fuente Única de Verdad):**
  - Creación de las 6 subcarpetas normativas en `.docs/`, consolidación de la documentación histórica/técnica y retiro de la carpeta antigua `docs/`.
- [x] **PLAN_02 — Teclado matemático visual y vista previa en tiempo real (Previo 2):** teclado de escritorio con 3 pestañas, inserción en el cursor, Tab al siguiente recuadro y renderizado 2D (fracciones, radicales, exponentes).
