/**
 * Edición asistida de expresiones matemáticas.
 *
 * Funciones puras que reciben el estado del campo `{ value, start, end }`
 * (texto y selección actual) y devuelven el nuevo estado con el cursor ya
 * ubicado donde el usuario debe seguir escribiendo.
 */

import { FUNCTION_NAMES } from '../../utils/mathEvaluator.js';

const FUNCTION_SET = new Set(FUNCTION_NAMES);

/** Operando simple que no necesita paréntesis al envolverlo: x, 2, 3.5, pi. */
const SIMPLE_OPERAND = /^[A-Za-z0-9.]+$/;

/** El texto termina en algo que puede actuar como base de una potencia. */
const OPERAND_END = /[A-Za-z0-9.)]$/;

const selected = ({ value, start, end }) => value.slice(start, end);

/**
 * Reemplaza la selección por `text` y ubica el cursor en `caretOffset`
 * (contado desde el inicio del texto insertado). Si el texto anterior termina
 * en letra y el insertado empieza por letra, agrega un espacio para que el
 * parser no los fusione (p. ej. «pi» + «x»).
 */
function splice(state, text, caretOffset = text.length) {
  const before = state.value.slice(0, state.start);
  const after = state.value.slice(state.end);
  const spacer = /[A-Za-z]$/.test(before) && /^[A-Za-z]/.test(text) ? ' ' : '';
  const caret = before.length + spacer.length + caretOffset;
  return { value: before + spacer + text + after, start: caret, end: caret };
}

/** Inserta texto literal en el cursor. */
export function insertText(state, text) {
  return splice(state, text);
}

/** Envuelve la selección entre paréntesis o inserta «()» con el cursor dentro. */
export function wrapParentheses(state) {
  const sel = selected(state);
  return sel ? splice(state, `(${sel})`) : splice(state, '()', 1);
}

/**
 * Potencia. Con selección la eleva completa; sin selección eleva lo que está
 * justo antes del cursor, o inserta «x» como base si no hay nada.
 * @param {object} state
 * @param {string|null} exponent exponente fijo ('2', '3', '-1') o null para uno libre
 */
export function applyPower(state, exponent) {
  const sel = selected(state);
  const tail = exponent === null ? '^()' : `^${exponent}`;
  const caretInTail = exponent === null ? 2 : tail.length;

  if (sel) {
    const base = SIMPLE_OPERAND.test(sel) ? sel : `(${sel})`;
    return splice(state, base + tail, base.length + caretInTail);
  }

  const lhs = state.value.slice(0, state.start).trimEnd();
  const base = OPERAND_END.test(lhs) ? '' : 'x';
  return splice(state, base + tail, base.length + caretInTail);
}

/** Potencia con base fija ('10') o libre (null): 10^( ) · ( )^( ). */
export function insertBasePower(state, base) {
  const sel = selected(state);

  if (base !== null) {
    return sel ? splice(state, `${base}^(${sel})`) : splice(state, `${base}^()`, base.length + 2);
  }

  if (sel) {
    const text = `(${sel})^()`;
    return splice(state, text, text.length - 1);
  }
  return splice(state, '()^()', 1);
}

/** Fracción: la selección pasa a ser el numerador; sin selección, «()/()». */
export function insertFraction(state) {
  const sel = selected(state);

  if (sel) {
    const numerator = SIMPLE_OPERAND.test(sel) ? sel : `(${sel})`;
    const text = `${numerator}/()`;
    return splice(state, text, text.length - 1);
  }
  return splice(state, '()/()', 1);
}

/**
 * Función con su paréntesis: la selección se convierte en el argumento.
 * Para funciones de dos argumentos (nroot) el cursor va al recuadro del índice.
 */
export function insertFunction(state, name, arity = 1) {
  const sel = selected(state);
  const separator = arity === 2 ? ', ' : '';
  const text = `${name}(${sel}${separator})`;

  if (sel) {
    return splice(state, text, arity === 2 ? text.length - 1 : text.length);
  }
  return splice(state, text, name.length + 1);
}

/** Mueve el cursor un carácter; con selección, la colapsa hacia ese lado. */
export function moveCaret(state, delta) {
  const { value, start, end } = state;
  if (start !== end) {
    const caret = delta < 0 ? start : end;
    return { value, start: caret, end: caret };
  }
  const caret = Math.min(Math.max(start + delta, 0), value.length);
  return { value, start: caret, end: caret };
}

/**
 * Retroceso inteligente: si el cursor está dentro de un par vacío «()» lo
 * elimina completo, junto con el nombre de la función que lo precede.
 */
export function deleteBackward(state) {
  const { value, start, end } = state;

  if (start !== end) {
    return { value: value.slice(0, start) + value.slice(end), start, end: start };
  }
  if (start === 0) return state;

  let from = start - 1;
  let to = start;

  if (value[from] === '(' && value[to] === ')') {
    to += 1;
    const name = /[A-Za-z][A-Za-z0-9]*$/.exec(value.slice(0, from));
    if (name && FUNCTION_SET.has(name[0].toLowerCase())) from -= name[0].length;
  }

  return { value: value.slice(0, from) + value.slice(to), start: from, end: from };
}

/** Borra todo el campo. */
export function clearAll() {
  return { value: '', start: 0, end: 0 };
}

/**
 * Posiciones de los recuadros vacíos: «()», «(,», «, )» y equivalentes.
 * @param {string} value
 * @returns {number[]}
 */
function slotPositions(value) {
  const positions = [];

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (char !== '(' && char !== ',' && char !== ';') continue;

    let j = i + 1;
    while (value[j] === ' ') j += 1;

    if (value[j] === ')' || value[j] === ',' || value[j] === ';') {
      positions.push(char === '(' ? i + 1 : j);
    }
  }

  return positions;
}

/**
 * Siguiente recuadro vacío después del cursor, o null si no hay ninguno.
 * @param {string} value
 * @param {number} caret
 * @returns {number|null}
 */
export function nextSlotPosition(value, caret) {
  return slotPositions(value).find((position) => position > caret) ?? null;
}

/** Salta al siguiente recuadro vacío (con vuelta al inicio) o al final del texto. */
export function jumpToNextSlot(state) {
  const { value, end } = state;
  const positions = slotPositions(value);
  const target = positions.find((position) => position > end) ?? positions[0] ?? value.length;
  return { value, start: target, end: target };
}
