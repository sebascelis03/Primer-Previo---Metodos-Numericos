import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, CircleAlert, Code2, Eraser, FlaskConical, Keyboard, Lightbulb, Play } from 'lucide-react';
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
      message: 'Haz clic en la casilla □ iluminada (o pulsa Tab / "Casilla □") para completar la ecuación.',
    };
  }

  return { state: 'invalid', message: check.message };
}

const DISPLAY_TONE = {
  empty: 'border-slate-700/80 bg-slate-900/70 focus-within:border-indigo-500 focus-within:ring-indigo-500/20',
  valid: 'border-emerald-500/30 bg-slate-900/80 focus-within:border-indigo-400 focus-within:ring-indigo-500/20',
  incomplete: 'border-amber-500/40 bg-slate-900/80 focus-within:border-amber-400 focus-within:ring-amber-400/20',
  invalid: 'border-rose-500/50 bg-rose-950/20 focus-within:border-rose-500 focus-within:ring-rose-500/20',
};

/**
 * Editor matemático visual estilo Photomath:
 * - La pantalla principal muestra la ecuación 2D grande con casillas `□`
 *   interactivas (clicables) y resalta en vivo el hueco o término donde está
 *   el cursor del usuario.
 * - Incluye una barra inferior integrada para edición directa con teclado
 *   físico y navegación por casillas con `Tab`.
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
  const selectionRef = useRef({ start: String(value ?? '').length, end: String(value ?? '').length });
  const [caretPos, setCaretPos] = useState(String(value ?? '').length);
  const [isKeypadOpen, setIsKeypadOpen] = useState(keypadDefaultOpen);

  const text = String(value ?? '');
  const trimmed = text.trim();
  const status = useMemo(() => describeExpression(trimmed), [trimmed]);

  /** Sincroniza la posición del cursor para iluminar la casilla □ activa en la ecuación 2D. */
  const syncSelection = (event) => {
    const start = event.target.selectionStart ?? 0;
    const end = event.target.selectionEnd ?? start;
    selectionRef.current = { start, end };
    setCaretPos(start);
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

  /** Ubica el cursor tanto en el input como en el visor matemático Photomath. */
  const placeCaret = (start, end = start) => {
    selectionRef.current = { start, end };
    setCaretPos(start);
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      input.setSelectionRange(start, end);
    });
  };

  /** Aplica una acción del teclado visual sobre el texto y la selección actuales. */
  const applyEdit = (transform) => {
    const next = transform({ value: text, ...readSelection() });
    if (next.value !== text) onChange(next.value);
    placeCaret(next.start, next.end);
  };

  /** Tab salta al siguiente recuadro vacío □. */
  const handleKeyDown = (event) => {
    if (event.key !== 'Tab' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = nextSlotPosition(text, event.currentTarget.selectionEnd ?? 0);
    if (target === null) return;
    event.preventDefault();
    placeCaret(target, target);
  };

  const handleExample = (example) => {
    onChange(example);
    placeCaret(example.length);
  };

  return (
    <div>
      {/* Cabecera del campo + botón de teclado */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsKeypadOpen((open) => !open)}
          aria-expanded={isKeypadOpen}
          aria-controls={`${id}-keypad`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold
                     text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200"
        >
          <Keyboard className="size-3.5" aria-hidden="true" />
          {isKeypadOpen ? 'Ocultar teclado' : 'Abrir teclado'}
          <ChevronDown
            className={`size-3.5 transition-transform ${isKeypadOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Pantalla unificada Photomath: Display 2D interactivo arriba + barra de entrada sincronizada abajo */}
      <div
        className={`overflow-hidden rounded-2xl border transition focus-within:ring-2 ${DISPLAY_TONE[status.state]}`}
      >
        {/* Barra de estado del visor matemático */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 bg-slate-950/40 px-3.5 py-1.5 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          <span>Ecuación interactiva · clic en cualquier □ para editar</span>
          {status.state === 'valid' ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 normal-case">
              <Check className="size-3" aria-hidden="true" />
              Lista para calcular
            </span>
          ) : null}
          {status.state === 'incomplete' ? (
            <span className="text-amber-300 normal-case">Completa las casillas □</span>
          ) : null}
          {status.state === 'invalid' ? (
            <span className="text-rose-300 normal-case">Revisa la sintaxis</span>
          ) : null}
        </div>

        {/* Display Matemático 2D (Protagonista principal tipo Photomath) */}
        <div className="px-4 py-3 text-slate-100">
          <MathPreview
            expression={text}
            prefix={prefix}
            caretPosition={caretPos}
            onSelectPosition={(pos) => placeCaret(pos, pos)}
          />
        </div>

        {/* Barra de entrada sincronizada con teclado físico */}
        <div className="flex items-center border-t border-white/10 bg-slate-950/60 px-3 py-1.5">
          <Code2 className="mr-2 size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="mr-2 shrink-0 font-mono text-xs font-semibold text-indigo-300/90">{prefix}</span>
          <input
            ref={inputRef}
            id={id}
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              onChange(event.target.value);
              syncSelection(event);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={syncSelection}
            onClick={syncSelection}
            onSelect={syncSelection}
            onFocus={syncSelection}
            className={`min-w-0 flex-1 bg-transparent font-mono text-xs transition placeholder:text-slate-600
                        focus:outline-none ${status.state === 'invalid' ? 'text-rose-200' : 'text-slate-300'}`}
            aria-invalid={status.state === 'invalid'}
            aria-describedby={`${id}-help`}
          />
        </div>
      </div>

      {/* Mensaje de ayuda o error */}
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

      {/* Teclado Photomath de doble panel */}
      {isKeypadOpen ? (
        <div id={`${id}-keypad`} className="animate-fade mt-3">
          <MathKeypad onEdit={applyEdit} />
        </div>
      ) : null}

      {/* Ejemplos renderizados en notación matemática */}
      {examples.length > 0 ? (
        <div className="mt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            <Lightbulb className="size-3.5" aria-hidden="true" />
            Ejemplos rápidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExample(example)}
                title={`Cargar ${example}`}
                className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-200
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
 * Par de campos de corte (tolerancia y máximo de iteraciones) común a los tres métodos.
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
