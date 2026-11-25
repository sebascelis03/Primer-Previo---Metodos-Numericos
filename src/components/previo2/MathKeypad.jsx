import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowRightToLine, Delete, Eraser } from 'lucide-react';
import MathPreview from './MathPreview.jsx';
import {
  applyPower,
  clearAll,
  deleteBackward,
  insertBasePower,
  insertFraction,
  insertFunction,
  insertText,
  jumpToNextSlot,
  moveCaret,
  wrapParentheses,
} from './mathEditing.js';

const fn = (name, arity = 1) => (state) => insertFunction(state, name, arity);
const text = (value) => (state) => insertText(state, value);

/**
 * Pestañas de plantillas matemáticas (panel izquierdo del teclado Photomath).
 */
const TABS = [
  {
    id: 'algebra',
    label: 'Raíces · Fracción · Potencias',
    columns: 'grid-cols-3',
    keys: [
      { preview: '()/()', title: 'Fracción apilada (a)/(b)', edit: insertFraction },
      { preview: 'x^2', title: 'Elevar al cuadrado (^2)', edit: (s) => applyPower(s, '2') },
      { preview: 'x^3', title: 'Elevar al cubo (^3)', edit: (s) => applyPower(s, '3') },
      { preview: 'x^()', title: 'Potencia con exponente libre (^)', edit: (s) => applyPower(s, null) },
      { preview: 'sqrt()', title: 'Raíz cuadrada: √(□)', edit: fn('sqrt') },
      { preview: 'cbrt()', title: 'Raíz cúbica: ∛(□)', edit: fn('cbrt') },
      { preview: 'nroot(, )', title: 'Raíz n-ésima: ⁿ√(□)', edit: fn('nroot', 2) },
      { preview: 'abs()', title: 'Valor absoluto: |□|', edit: fn('abs') },
      { preview: 'exp(-x)', title: 'Exponencial e⁻ˣ', edit: text('exp(-x)') },
      { preview: 'exp()', title: 'Exponencial natural: e^(□)', edit: fn('exp') },
      { preview: 'ln()', title: 'Logaritmo natural: ln(□)', edit: fn('ln') },
      { preview: 'pi', title: 'Constante π (pi)', edit: text('pi') },
    ],
  },
  {
    id: 'trig',
    label: 'Trigonométricas',
    columns: 'grid-cols-3',
    keys: [
      { preview: 'sin()', title: 'Seno: sin(□)', edit: fn('sin') },
      { preview: 'cos()', title: 'Coseno: cos(□)', edit: fn('cos') },
      { preview: 'tan()', title: 'Tangente: tan(□)', edit: fn('tan') },
      { preview: 'asin()', title: 'Arcoseno: sin⁻¹(□)', edit: fn('asin') },
      { preview: 'acos()', title: 'Arcocoseno: cos⁻¹(□)', edit: fn('acos') },
      { preview: 'atan()', title: 'Arcotangente: tan⁻¹(□)', edit: fn('atan') },
      { preview: 'sinh()', title: 'Seno hiperbólico: sinh(□)', edit: fn('sinh') },
      { preview: 'cosh()', title: 'Coseno hiperbólico: cosh(□)', edit: fn('cosh') },
      { preview: 'tanh()', title: 'Tangente hiperbólica: tanh(□)', edit: fn('tanh') },
    ],
  },
  {
    id: 'exp-log',
    label: 'Logaritmos · Más',
    columns: 'grid-cols-3',
    keys: [
      { preview: 'exp()', title: 'Exponencial natural: e^(□)', edit: fn('exp') },
      { preview: '10^()', title: 'Potencia de diez: 10^(□)', edit: (s) => insertBasePower(s, '10') },
      { preview: '()^()', title: 'Base y exponente libres: (□)^(□)', edit: (s) => insertBasePower(s, null) },
      { preview: 'ln()', title: 'Logaritmo natural: ln(□)', edit: fn('ln') },
      { preview: 'log10()', title: 'Logaritmo base 10: log₁₀(□)', edit: fn('log10') },
      { preview: 'x^-1', title: 'Inverso: x⁻¹', edit: (s) => applyPower(s, '-1') },
      { preview: 'pi', title: 'Constante π (pi)', edit: text('pi') },
      { preview: 'e', title: 'Constante e de Euler', edit: text('e') },
      { preview: 'abs()', title: 'Valor absoluto: |□|', edit: fn('abs') },
    ],
  },
];

/**
 * Pad numérico y algebraico fijo (panel derecho al estilo Photomath).
 * Permite construir toda la ecuación con el mouse sin cambiar de pestaña.
 */
const NUMPAD_ROWS = [
  [
    { label: '7', title: '7', edit: text('7'), kind: 'num' },
    { label: '8', title: '8', edit: text('8'), kind: 'num' },
    { label: '9', title: '9', edit: text('9'), kind: 'num' },
    { label: '÷', title: 'División / Fracción', edit: text('/'), kind: 'op' },
  ],
  [
    { label: '4', title: '4', edit: text('4'), kind: 'num' },
    { label: '5', title: '5', edit: text('5'), kind: 'num' },
    { label: '6', title: '6', edit: text('6'), kind: 'num' },
    { label: '×', title: 'Multiplicación', edit: text('*'), kind: 'op' },
  ],
  [
    { label: '1', title: '1', edit: text('1'), kind: 'num' },
    { label: '2', title: '2', edit: text('2'), kind: 'num' },
    { label: '3', title: '3', edit: text('3'), kind: 'num' },
    { label: '−', title: 'Resta', edit: text('-'), kind: 'op' },
  ],
  [
    { label: '0', title: '0', edit: text('0'), kind: 'num' },
    { label: '.', title: 'Punto decimal', edit: text('.'), kind: 'num' },
    { label: '( )', title: 'Paréntesis (envuelve la selección)', edit: wrapParentheses, kind: 'op' },
    { label: '+', title: 'Suma', edit: text('+'), kind: 'op' },
  ],
];

function Key({ title, onPress, className = '', children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
      className={`math-key ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Teclado matemático visual estilo Photomath para escritorio:
 * - Izquierda: plantillas visuales de funciones (raíces, fracciones, potencias, trig, log).
 * - Derecha: pad numérico (0–9, punto, paréntesis, +, −, ×, ÷) y variable destacada `x`.
 * - Barra inferior: mover cursor (←/→), saltar al siguiente recuadro `□`, borrar (⌫) y limpiar.
 */
export default function MathKeypad({ onEdit }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const tab = TABS.find((item) => item.id === activeTab) ?? TABS[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 shadow-inner">
      {/* Pestañas superiores */}
      <div
        role="tablist"
        aria-label="Categorías de funciones"
        className="mb-2.5 grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1"
      >
        {TABS.map((item) => {
          const isActive = item.id === tab.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setActiveTab(item.id)}
              className={`truncate rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Layout Split Photomath: Plantillas a la izquierda | Pad numérico a la derecha */}
      <div className="grid gap-2.5 sm:grid-cols-[1.2fr_1fr]">
        {/* Panel izquierdo: plantillas matemáticas */}
        <div role="tabpanel" className={`grid content-start gap-1.5 ${tab.columns}`}>
          {tab.keys.map((key) => (
            <Key key={key.title} title={key.title} onPress={() => onEdit(key.edit)} className="math-key-fn">
              <MathPreview expression={key.preview} compact />
            </Key>
          ))}
        </div>

        {/* Panel derecho: pad numérico + operadores */}
        <div className="grid grid-cols-4 gap-1.5 border-t border-white/10 pt-2.5 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-2.5">
          {NUMPAD_ROWS.flat().map((key) => (
            <Key
              key={key.title}
              title={key.title}
              onPress={() => onEdit(key.edit)}
              className={key.kind === 'op' ? 'math-key-op' : 'math-key-num'}
            >
              {key.label}
            </Key>
          ))}
        </div>
      </div>

      {/* Barra inferior: Variable x, navegación entre casillas □ y borrado */}
      <div className="mt-2.5 grid grid-cols-[1.2fr_0.9fr_0.9fr_1.9fr_1fr_1.3fr] gap-1.5 border-t border-white/10 pt-2.5">
        <Key
          title="Insertar variable x"
          onPress={() => onEdit(text('x'))}
          className="border-indigo-500/40 bg-indigo-500/20 font-serif text-lg italic font-bold text-indigo-200 hover:bg-indigo-500/30"
        >
          x
        </Key>
        <Key title="Mover cursor a la izquierda" onPress={() => onEdit((s) => moveCaret(s, -1))} className="math-key-nav">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Mover cursor a la derecha" onPress={() => onEdit((s) => moveCaret(s, 1))} className="math-key-nav">
          <ArrowRight className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Saltar a la siguiente casilla □ vacía (Tab)" onPress={() => onEdit(jumpToNextSlot)} className="math-key-nav text-amber-200">
          <ArrowRightToLine className="size-4" aria-hidden="true" />
          <span>Casilla □</span>
        </Key>
        <Key title="Borrar hacia atrás (elimina función vacía de un toque)" onPress={() => onEdit(deleteBackward)} className="math-key-nav">
          <Delete className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Vaciar toda la expresión" onPress={() => onEdit(clearAll)} className="math-key-nav math-key-danger">
          <Eraser className="size-4" aria-hidden="true" />
          <span>Limpiar</span>
        </Key>
      </div>
    </div>
  );
}
