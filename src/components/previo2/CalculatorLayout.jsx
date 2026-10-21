/**
 * Estructura de dos columnas compartida por las calculadoras del Previo 2:
 * entradas a la izquierda (fijas al hacer scroll en escritorio) y resultados
 * a la derecha. En móvil el layout se apila en una sola columna fluida.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.inputs panel de entrada
 * @param {import('react').ReactNode} props.results panel de resultados
 */
export default function CalculatorLayout({ inputs, results }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="scrollbar-slim no-print lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-1">
        {inputs}
      </div>

      <div className="flex min-w-0 flex-col gap-5">{results}</div>
    </div>
  );
}
