import { CircleAlert, Eraser, FlaskConical, Lightbulb, Play } from 'lucide-react';
import { checkExpression, SYNTAX_HELP } from '../../utils/mathEvaluator.js';
import { parseField } from './format.js';

/**
 * Campo de texto para una expresión matemática, con validación en vivo y
 * ejemplos de un clic.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label etiqueta visible del campo
 * @param {string} props.prefix notación que precede al campo, p. ej. 'g(x) ='
 * @param {string} props.value
 * @param {(value:string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string[]} [props.examples] expresiones sugeridas
 * @param {string} [props.hint] texto de ayuda bajo el campo; por omisión, la sintaxis admitida
 */
export function ExpressionField({ id, label, prefix, value, onChange, placeholder, examples = [], hint = SYNTAX_HELP }) {
  const trimmed = String(value ?? '').trim();
  const check = trimmed === '' ? { valid: true, message: '' } : checkExpression(trimmed);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </label>

      {/* El prefijo vive en su propia celda, de modo que el campo siempre
          empieza después de la notación por larga que esta sea. */}
      <div
        className={`flex items-stretch overflow-hidden rounded-lg border bg-slate-800/60 transition
                    focus-within:ring-2 ${
                      check.valid
                        ? 'border-slate-700 focus-within:border-indigo-500 focus-within:ring-indigo-500/20'
                        : 'border-rose-500/60 focus-within:border-rose-500 focus-within:ring-rose-500/20'
                    }`}
      >
        <span className="grid shrink-0 place-items-center border-r border-white/10 bg-slate-900/50 px-3 font-mono text-sm font-semibold text-indigo-300">
          {prefix}
        </span>
        <input
          id={id}
          type="text"
          autoComplete="off"
          spellCheck="false"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm transition placeholder:text-slate-500
                      focus:outline-none ${check.valid ? 'text-slate-100' : 'text-rose-200'}`}
          aria-invalid={!check.valid}
          aria-describedby={`${id}-help`}
        />
      </div>

      <div id={`${id}-help`}>
        {check.valid ? (
          hint ? (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          ) : null
        ) : (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-300">
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {check.message}
          </p>
        )}
      </div>

      {examples.length > 0 ? (
        <div className="mt-2">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Lightbulb className="size-3.5" aria-hidden="true" />
            Ejemplos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => onChange(example)}
                title={`Usar ${example}`}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-300
                           transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200 active:scale-95"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Campo numérico breve con validación visual.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {(value:string) => void} props.onChange
 * @param {string} [props.hint]
 * @param {boolean} [props.integer=false] solo admite dígitos
 * @param {boolean} [props.allowEmpty=false] la cadena vacía no se marca como error
 */
export function NumberField({ id, label, value, onChange, hint, integer = false, allowEmpty = false }) {
  const raw = String(value ?? '').trim();
  const isValid = raw === '' ? allowEmpty : Number.isFinite(parseField(raw));

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={integer ? 'numeric' : 'decimal'}
        autoComplete="off"
        spellCheck="false"
        value={value}
        onChange={(event) => onChange(integer ? event.target.value.replace(/[^\d]/g, '') : event.target.value)}
        className={`field-input ${isValid ? '' : 'matrix-cell-invalid'}`}
        aria-invalid={!isValid}
      />
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

/**
 * Par de campos de corte (tolerancia y máximo de iteraciones) común a los
 * tres métodos.
 *
 * @param {object} props
 * @param {string} props.idPrefix prefijo para los identificadores de los campos
 * @param {string} props.tolerance
 * @param {string} props.maxIterations
 * @param {(value:string) => void} props.onToleranceChange
 * @param {(value:string) => void} props.onMaxIterationsChange
 */
export function StopCriteriaFields({ idPrefix, tolerance, maxIterations, onToleranceChange, onMaxIterationsChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <NumberField
        id={`${idPrefix}-tolerance`}
        label="Tolerancia (% error)"
        value={tolerance}
        onChange={onToleranceChange}
        hint="Se compara contra el error relativo porcentual."
      />
      <NumberField
        id={`${idPrefix}-max-iterations`}
        label="Máx. iteraciones"
        value={maxIterations}
        onChange={onMaxIterationsChange}
        hint="Corte de seguridad si el método no converge."
        integer
      />
    </div>
  );
}

/**
 * Fila de acciones: calcular, cargar ejemplo y limpiar.
 *
 * @param {object} props
 * @param {string} props.primaryLabel texto del botón principal
 * @param {() => void} props.onSolve
 * @param {() => void} props.onLoadExample
 * @param {() => void} props.onReset
 */
export function ActionRow({ primaryLabel, onSolve, onLoadExample, onReset }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <button
        type="button"
        onClick={onSolve}
        className="btn bg-gradient-to-r from-indigo-600 to-cyan-600 text-white
                   hover:from-indigo-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/25
                   sm:col-span-2"
      >
        <Play className="size-4" aria-hidden="true" />
        {primaryLabel}
      </button>

      <button
        type="button"
        onClick={onLoadExample}
        className="btn border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100"
      >
        <FlaskConical className="size-4" aria-hidden="true" />
        Cargar ejemplo
      </button>

      <button
        type="button"
        onClick={onReset}
        className="btn border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100"
      >
        <Eraser className="size-4" aria-hidden="true" />
        Limpiar
      </button>
    </div>
  );
}
