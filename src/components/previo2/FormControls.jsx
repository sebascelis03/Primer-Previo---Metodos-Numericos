import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, CircleAlert, Eraser, FlaskConical, Keyboard, Lightbulb, Play } from 'lucide-react';
import { checkExpression, parseExpressionAST, SYNTAX_HELP } from '../../utils/mathEvaluator.js';
import { parseField } from './format.js';
import MathPreview from './MathPreview.jsx';
import MathKeypad from './MathKeypad.jsx';
import { nextSlotPosition } from './mathEditing.js';

/**
 * Clasifica la expresión para la retroalimentación en vivo:
 *  - 'empty'      campo vacío
 *  - 'valid'      lista para evaluar
 *  - 'incomplete' bien encaminada, pero con recuadros por completar
 *  - 'invalid'    error de sintaxis real
 * @param {string} source
 */
function describeExpression(source) {
  if (source === '') return { state: 'empty', message: '' };

  const check = checkExpression(source);
  if (check.valid) return { state: 'valid', message: '' };

  const tolerant = parseExpressionAST(source);
  if (tolerant.ast && tolerant.incomplete && !tolerant.malformed) {
    return {
      state: 'incomplete',
      message: 'Expresión incompleta: llene los recuadros punteados (Tab salta al siguiente).',
    };
  }

  return { state: 'invalid', message: check.message };
}

const FIELD_TONE = {
  empty: 'border-slate-700 focus-within:border-indigo-500 focus-within:ring-indigo-500/20',
  valid: 'border-slate-700 focus-within:border-indigo-500 focus-within:ring-indigo-500/20',
  incomplete: 'border-amber-500/50 focus-within:border-amber-400 focus-within:ring-amber-400/20',
  invalid: 'border-rose-500/60 focus-within:border-rose-500 focus-within:ring-rose-500/20',
};

/**
 * Campo para una expresión matemática con teclado visual, vista previa
 * renderizada en tiempo real, validación en vivo y ejemplos de un clic.
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
 * @param {boolean} [props.keypadDefaultOpen=true] el teclado matemático arranca desplegado
 */
export function ExpressionField({
  id,
  label,
  prefix,
  value,
  onChange,
  placeholder,
  examples = [],
  hint = SYNTAX_HELP,
  keypadDefaultOpen = true,
}) {
  const inputRef = useRef(null);
  const selectionRef = useRef(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState(keypadDefaultOpen);

  const text = String(value ?? '');
  const trimmed = text.trim();
  const status = useMemo(() => describeExpression(trimmed), [trimmed]);

  /** Guarda la última selección conocida para insertar aunque el campo no tenga foco. */
  const rememberSelection = (event) => {
    selectionRef.current = { start: event.target.selectionStart ?? 0, end: event.target.selectionEnd ?? 0 };
  };

  const readSelection = () => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      return { start: input.selectionStart ?? text.length, end: input.selectionEnd ?? text.length };
    }
    const saved = selectionRef.current;
    if (!saved) return { start: text.length, end: text.length };
    return { start: Math.min(saved.start, text.length), end: Math.min(saved.end, text.length) };
  };

  /** Ubica el cursor después de que React haya aplicado el nuevo valor. */
  const placeCaret = (start, end = start) => {
    selectionRef.current = { start, end };
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(start, end);
    });
  };

  /** Aplica una transformación del teclado sobre el texto y la selección actuales. */
  const applyEdit = (transform) => {
    const next = transform({ value: text, ...readSelection() });
    if (next.value !== text) onChange(next.value);
    placeCaret(next.start, next.end);
  };

  /** Tab salta al siguiente recuadro vacío; si no queda ninguno, avanza el foco normalmente. */
  const handleKeyDown = (event) => {
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = nextSlotPosition(text, event.currentTarget.selectionEnd ?? 0);
    if (target === null) return;
    event.preventDefault();
    event.currentTarget.setSelectionRange(target, target);
    selectionRef.current = { start: target, end: target };
  };

  const handleExample = (example) => {
    onChange(example);
    placeCaret(example.length);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsKeypadOpen((open) => !open)}
          aria-expanded={isKeypadOpen}
          aria-controls={`${id}-keypad`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold
                     text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200"
        >
          <Keyboard className="size-3.5" aria-hidden="true" />
          {isKeypadOpen ? 'Ocultar teclado' : 'Teclado matemático'}
          <ChevronDown
            className={`size-3.5 transition-transform ${isKeypadOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* El prefijo vive en su propia celda, de modo que el campo siempre
          empieza después de la notación por larga que esta sea. */}
      <div
        className={`flex items-stretch overflow-hidden rounded-lg border bg-slate-800/60 transition focus-within:ring-2 ${
          FIELD_TONE[status.state]
        }`}
      >
        <span className="grid shrink-0 place-items-center border-r border-white/10 bg-slate-900/50 px-3 font-mono text-sm font-semibold text-indigo-300">
          {prefix}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          spellCheck="false"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={rememberSelection}
          onBlur={rememberSelection}
          className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm transition placeholder:text-slate-500
                      focus:outline-none ${status.state === 'invalid' ? 'text-rose-200' : 'text-slate-100'}`}
          aria-invalid={status.state === 'invalid'}
          aria-describedby={`${id}-help`}
        />
      </div>

      {/* Vista previa con notación matemática real */}
      <div
        className={`mt-2 rounded-xl border px-3.5 py-2 transition ${
          status.state === 'valid'
            ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
            : status.state === 'incomplete'
              ? 'border-amber-500/20 bg-amber-500/[0.04]'
              : 'border-white/10 bg-slate-950/40'
        }`}
      >
        <p className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
          <span>Vista previa</span>
          {status.state === 'valid' ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 normal-case">
              <Check className="size-3" aria-hidden="true" />
              Lista para calcular
            </span>
          ) : null}
          {status.state === 'incomplete' ? <span className="text-amber-300 normal-case">Incompleta</span> : null}
        </p>
        <div className="text-slate-100">
          <MathPreview expression={text} prefix={prefix} />
        </div>
      </div>

      <div id={`${id}-help`}>
        {status.state === 'invalid' || status.state === 'incomplete' ? (
          <p
            className={`mt-1.5 flex items-start gap-1.5 text-xs ${
              status.state === 'invalid' ? 'text-rose-300' : 'text-amber-300'
            }`}
          >
            <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {status.message}
          </p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>

      {isKeypadOpen ? (
        <div id={`${id}-keypad`} className="animate-fade mt-3">
          <MathKeypad onEdit={applyEdit} />
        </div>
      ) : null}

      {examples.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Lightbulb className="size-3.5" aria-hidden="true" />
            Ejemplos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExample(example)}
                title={`Usar ${example}`}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200
                           transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-100 active:scale-95"
              >
                <MathPreview expression={example} compact />
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
