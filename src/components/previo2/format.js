/**
 * Utilidades de presentación compartidas por las calculadoras del Previo 2.
 * El redondeo vive aquí: los módulos de cálculo conservan toda la precisión
 * de punto flotante y solo la capa visual recorta a 6 decimales.
 */

import { DECIMALS } from '../../utils/numericalMethods.js';

/**
 * Formatea un valor numérico a 6 decimales fijos.
 * @param {number|null|undefined} value
 * @returns {string} número formateado, '—' si no hay dato o '∞' si no es finito
 */
export const fmt = (value) => {
  if (value === null || value === undefined) return '—';
  if (!Number.isFinite(value)) return Number.isNaN(value) ? '—' : '∞';
  return value.toFixed(DECIMALS);
};

/**
 * Formatea un error relativo porcentual. Los valores muy pequeños se muestran
 * en notación científica para que no se confundan con un cero exacto.
 * @param {number|null|undefined} value
 * @returns {string}
 */
export const fmtPercent = (value) => {
  if (value === null || value === undefined) return '—';
  if (!Number.isFinite(value)) return '∞';
  if (value !== 0 && Math.abs(value) < 1e-5) return value.toExponential(2);
  return value.toFixed(DECIMALS);
};

/**
 * Formatea un residual: siempre en notación científica, porque su interés
 * está en el orden de magnitud con el que se acerca a cero.
 * @param {number|null|undefined} value
 * @returns {string}
 */
export const fmtResidual = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (!Number.isFinite(value)) return '∞';
  if (value === 0) return '0';
  return value.toExponential(3);
};

/**
 * Paleta y textos asociados a cada estado de convergencia, compartidos por las
 * tarjetas de resultado de los tres métodos.
 */
export const STATUS_TONES = {
  converged: {
    label: 'Convergió',
    card: 'border-emerald-500/30 bg-emerald-500/10',
    badge: 'bg-emerald-500/20 text-emerald-300',
    value: 'text-emerald-300',
    text: 'text-emerald-200/80',
  },
  'max-iterations': {
    label: 'Máx. iteraciones',
    card: 'border-amber-500/30 bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-200',
    value: 'text-amber-200',
    text: 'text-amber-200/80',
  },
  diverged: {
    label: 'Divergió',
    card: 'border-rose-500/30 bg-rose-500/10',
    badge: 'bg-rose-500/20 text-rose-200',
    value: 'text-rose-200',
    text: 'text-rose-200/80',
  },
  'zero-derivative': {
    label: 'Derivada nula',
    card: 'border-rose-500/30 bg-rose-500/10',
    badge: 'bg-rose-500/20 text-rose-200',
    value: 'text-rose-200',
    text: 'text-rose-200/80',
  },
  partial: {
    label: 'Convergencia parcial',
    card: 'border-amber-500/30 bg-amber-500/10',
    badge: 'bg-amber-500/20 text-amber-200',
    value: 'text-amber-200',
    text: 'text-amber-200/80',
  },
};

/**
 * Color del error relativo según su magnitud frente a la tolerancia.
 * @param {number|null} error
 * @param {number} tolerance
 * @returns {string} clases de Tailwind
 */
export const errorTone = (error, tolerance) => {
  if (error === null || error === undefined) return 'text-slate-500';
  if (!Number.isFinite(error)) return 'font-semibold text-rose-400';
  if (error <= tolerance) return 'font-semibold text-emerald-400';
  if (error < 1) return 'text-slate-300';
  return 'text-amber-400';
};

/**
 * Convierte el texto de un campo a número aceptando la coma decimal
 * (convención local es-CO). La cadena vacía se reporta como NaN para que el
 * llamador decida si es un error o un valor opcional.
 * @param {string} raw
 * @returns {number}
 */
export const parseField = (raw) => {
  const trimmed = String(raw ?? '').trim().replace(',', '.');
  if (trimmed === '') return Number.NaN;
  return Number(trimmed);
};
