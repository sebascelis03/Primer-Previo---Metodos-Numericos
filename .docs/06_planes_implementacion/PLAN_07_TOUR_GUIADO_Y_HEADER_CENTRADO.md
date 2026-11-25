# PLAN DE IMPLEMENTACIÓN #7: Botones de Previos Centrados + Recorrido Guiado Contextual (Bombillo Paso a Paso)

- **Estado:** Aprobado y Ejecutado
- **Fecha:** 24 de noviembre de 2026

## 1. Qué se hizo
1. **Botones `Previo 1 / Previo 2` Centrados (`src/App.jsx`):**
   - El header se organizó en una cuadrícula de 3 zonas (`lg:grid-cols-[1fr_auto_1fr]`): título a la izquierda, selector `[ Previo 1 | Previo 2 ]` exactamente en el centro y botones de utilidades a la derecha.
2. **Botón de Bombillo Encendido + Tour Guiado Contextual No Invasivo (`src/components/GuidedTourModal.jsx`):**
   - Se agregó un botón con ícono de bombillo encendido (`Lightbulb` en ámbar) al lado izquierdo del menú hamburguesa.
   - Al pulsarlo, abre una ventana modal flotante y no invasiva en la esquina inferior derecha con recorrido paso a paso adaptado exactamente a la calculadora activa (`previo-1`, `fixed-point`, `newton-raphson` o `bairstow`), iluminando suavemente la sección explicada (`.tour-highlight`) y permitiendo avanzar al siguiente paso o cerrar la ventana en cualquier momento.
