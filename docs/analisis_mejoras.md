# Análisis del Sistema y Oportunidades de Mejora

## ✅ Lo que está bien hecho (no tocar)

- **Motor matemático** → Sólido, funciones puras, buena separación de responsabilidades.
- **Criterio de parada** → Correcto (error relativo porcentual máximo, criterio Chapra).
- **Redondeo** → Internamente preciso, redondea solo en la salida. Excelente.
- **Validaciones** → Cubre ceros en diagonal, inputs no numéricos, tolerancia negativa.
- **Dominancia diagonal** → Muestra el detalle fila por fila con `|a_ii| > Σ|a_ij|`. Muy visual.
- **Residual** → Verificación independiente `r = b − A·x`. Punto extra académico.
- **EmptyState** → Muestra las fórmulas de iteración antes de calcular. Excelente toque pedagógico.
- **PWA + offline** → Funcional.

---

## 🔧 Cosas que se podrían mejorar/agregar

### 1. No hay forma de exportar o imprimir los resultados
El profesor seguramente quiere ver el paso a paso en papel o en un PDF. Aunque hay clases `.no-print` en el CSS, no hay un botón de "Imprimir resultados" o "Exportar a PDF". Sería muy útil un botón que abra `window.print()` con un formato limpio.

### 2. No se muestra la fórmula de despeje para cada variable
Para "guía de aprendizaje", sería un plus que al resolver el sistema la app muestre el despeje explícito. Por ejemplo:
```
x₁ = (7 - (-1)·x₂ - (1)·x₃) / 4
x₂ = (-21 - (4)·x₁ - (1)·x₃) / -8
x₃ = (15 - (-2)·x₁ - (1)·x₂) / 5
```
Esto demuestra comprensión de cómo se "arma" cada iteración.

### 3. No hay gráfica de convergencia
Una gráfica simple de **Error (%) vs Iteración (k)** sería muy visual y le encantaría al profesor. Mostraría la curva bajando hasta cruzar la línea de tolerancia. En modo duelo, ambas curvas superpuestas demostrarían visualmente que Gauss-Seidel baja más rápido.

### 4. No se indica cuál es la solución exacta ni se compara
El sistema de ejemplo tiene solución exacta `(2, 4, 3)`. Podría tener un campo opcional donde el usuario ingrese la solución analítica y la app calcule el **error verdadero** (no solo el aproximado), demostrando aún más dominio del tema.

### 5. El footer es genérico
No tiene los nombres del equipo, la materia, el profesor, ni la universidad. *(Solución pendiente: Menú hamburguesa con integrantes).*

### 6. No hay manejo de reordenamiento automático de ecuaciones
La app avisa si la diagonal tiene ceros o si no hay dominancia, pero no ofrece intentar **reordenar las filas** automáticamente para lograr dominancia diagonal. Es un feature avanzado pero no indispensable.

### 7. La tabla de iteraciones no resalta la fila final de convergencia de forma más obvia
Sí tiene un `bg-emerald-50` sutil, pero podría tener un ícono de ✓ o un borde más marcado para que el profesor vea inmediatamente dónde convergió.

---

## 🐛 Posibles problemas menores

### 8. `index.html` usa ruta absoluta
Usa `<script type="module" src="/src/main.jsx"></script>` pero `vite.config.js` usa `base: './'`. Vite lo resuelve en el build, pero es una inconsistencia.

### 9. No hay test runner configurado
Claude mencionó "24 aserciones automatizadas", pero no hay script `"test"` en `package.json`. Si el profesor pregunta cómo validaron el motor matemático, no podrán reproducir los tests.
