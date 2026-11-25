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
 * Grupos del teclado. `preview` es la expresión que se dibuja en el botón
 * (con recuadros punteados para lo que falta completar) y `edit` la
 * transformación que se aplica al campo.
 */
const TABS = [
  {
    id: 'algebra',
    label: 'Potencias y raíces',
    columns: 'grid-cols-6',
    keys: [
      { preview: 'x', title: 'Variable x', edit: text('x') },
      { preview: 'x^2', title: 'Elevar al cuadrado (^2)', edit: (s) => applyPower(s, '2') },
      { preview: 'x^3', title: 'Elevar al cubo (^3)', edit: (s) => applyPower(s, '3') },
      { preview: 'x^()', title: 'Potencia con exponente libre (^)', edit: (s) => applyPower(s, null) },
      { preview: 'x^-1', title: 'Recíproco (^-1)', edit: (s) => applyPower(s, '-1') },
      { preview: '()/()', title: 'Fracción (a)/(b)', edit: insertFraction },
      { preview: 'sqrt()', title: 'Raíz cuadrada: sqrt( )', edit: fn('sqrt') },
      { preview: 'cbrt()', title: 'Raíz cúbica: cbrt( )', edit: fn('cbrt') },
      { preview: 'nroot(, )', title: 'Raíz n-ésima: nroot(x, n)', edit: fn('nroot', 2) },
      { preview: 'abs()', title: 'Valor absoluto: abs( )', edit: fn('abs') },
      { preview: 'pi', title: 'Constante π (pi)', edit: text('pi') },
      { preview: 'e', title: 'Constante e de Euler', edit: text('e') },
    ],
  },
  {
    id: 'exp-log',
    label: 'Exp · Log · Constantes',
    columns: 'grid-cols-4',
    keys: [
      { preview: 'exp()', title: 'Exponencial natural: exp( )', edit: fn('exp') },
      { preview: 'exp(-x)', title: 'Exponencial negativa: exp(-x)', edit: text('exp(-x)') },
      { preview: '10^()', title: 'Potencia de diez: 10^( )', edit: (s) => insertBasePower(s, '10') },
      { preview: '()^()', title: 'Potencia general: ( )^( )', edit: (s) => insertBasePower(s, null) },
      { preview: 'ln()', title: 'Logaritmo natural: ln( )', edit: fn('ln') },
      { preview: 'log10()', title: 'Logaritmo en base 10: log10( )', edit: fn('log10') },
      { preview: 'pi', title: 'Constante π (pi)', edit: text('pi') },
      { preview: 'e', title: 'Constante e de Euler', edit: text('e') },
    ],
  },
  {
    id: 'trig',
    label: 'Trigonométricas',
    columns: 'grid-cols-3',
    keys: [
      { preview: 'sin()', title: 'Seno: sin( )', edit: fn('sin') },
      { preview: 'cos()', title: 'Coseno: cos( )', edit: fn('cos') },
      { preview: 'tan()', title: 'Tangente: tan( )', edit: fn('tan') },
      { preview: 'asin()', title: 'Arcoseno: asin( )', edit: fn('asin') },
      { preview: 'acos()', title: 'Arcocoseno: acos( )', edit: fn('acos') },
      { preview: 'atan()', title: 'Arcotangente: atan( )', edit: fn('atan') },
      { preview: 'sinh()', title: 'Seno hiperbólico: sinh( )', edit: fn('sinh') },
      { preview: 'cosh()', title: 'Coseno hiperbólico: cosh( )', edit: fn('cosh') },
      { preview: 'tanh()', title: 'Tangente hiperbólica: tanh( )', edit: fn('tanh') },
    ],
  },
];

/** Operadores siempre visibles, sin importar la pestaña activa. */
const OPERATOR_KEYS = [
  { label: '+', title: 'Suma', edit: text('+') },
  { label: '−', title: 'Resta', edit: text('-') },
  { label: '×', title: 'Multiplicación', edit: text('*') },
  { label: '÷', title: 'División', edit: text('/') },
  { label: '( )', title: 'Paréntesis (envuelve la selección)', edit: wrapParentheses },
  { label: 'x', title: 'Variable x', edit: text('x'), italic: true },
];

/**
 * Botón del teclado. `preventDefault` en mousedown evita que el campo pierda
 * el foco, de modo que la selección del usuario se conserva al pulsar.
 */
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
 * Teclado matemático visual para escritorio, al estilo de GeoGebra o
 * Photomath. Cada botón inserta la sintaxis correcta en la posición del
 * cursor y deja el cursor dentro del hueco que hay que completar.
 *
 * @param {object} props
 * @param {(transform: (state:{value:string,start:number,end:number}) => {value:string,start:number,end:number}) => void} props.onEdit
 */
export default function MathKeypad({ onEdit }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const tab = TABS.find((item) => item.id === activeTab) ?? TABS[0];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2.5">
      {/* Pestañas de grupos de funciones */}
      <div role="tablist" aria-label="Grupos de funciones" className="mb-2.5 grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1">
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

      {/* Funciones del grupo activo */}
      <div role="tabpanel" className={`grid gap-1.5 ${tab.columns}`}>
        {tab.keys.map((key) => (
          <Key key={key.title} title={key.title} onPress={() => onEdit(key.edit)} className="math-key-fn">
            <MathPreview expression={key.preview} compact />
          </Key>
        ))}
      </div>

      {/* Operadores básicos */}
      <div className="mt-2.5 grid grid-cols-6 gap-1.5 border-t border-white/10 pt-2.5">
        {OPERATOR_KEYS.map((key) => (
          <Key
            key={key.title}
            title={key.title}
            onPress={() => onEdit(key.edit)}
            className={`math-key-op ${key.italic ? 'math-key-var' : ''}`}
          >
            {key.label}
          </Key>
        ))}
      </div>

      {/* Navegación y borrado */}
      <div className="mt-1.5 grid grid-cols-[1fr_1fr_2fr_1fr_1.4fr] gap-1.5">
        <Key title="Mover el cursor a la izquierda" onPress={() => onEdit((s) => moveCaret(s, -1))} className="math-key-nav">
          <ArrowLeft className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Mover el cursor a la derecha" onPress={() => onEdit((s) => moveCaret(s, 1))} className="math-key-nav">
          <ArrowRight className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Ir al siguiente recuadro vacío (Tab)" onPress={() => onEdit(jumpToNextSlot)} className="math-key-nav">
          <ArrowRightToLine className="size-4" aria-hidden="true" />
          <span>Siguiente</span>
        </Key>
        <Key title="Borrar hacia atrás" onPress={() => onEdit(deleteBackward)} className="math-key-nav">
          <Delete className="size-4" aria-hidden="true" />
        </Key>
        <Key title="Limpiar el campo" onPress={() => onEdit(clearAll)} className="math-key-nav math-key-danger">
          <Eraser className="size-4" aria-hidden="true" />
          <span>Limpiar</span>
        </Key>
      </div>
    </div>
  );
}
