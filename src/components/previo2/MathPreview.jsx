import { useMemo } from 'react';
import { parseExpressionAST } from '../../utils/mathEvaluator.js';

/** Nombre visible de cada función (log es el logaritmo natural en el motor). */
const FUNCTION_LABELS = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  asin: 'sin',
  acos: 'cos',
  atan: 'tan',
  sinh: 'sinh',
  cosh: 'cosh',
  tanh: 'tanh',
  ln: 'ln',
  log: 'ln',
};

const INVERSE_TRIG = new Set(['asin', 'acos', 'atan']);
const RADICALS = new Set(['sqrt', 'cbrt', 'nroot', 'root']);
const CONSTANT_LABELS = { pi: 'π', e: 'e', tau: 'τ' };

/** Precedencia visual: decide cuándo un subárbol necesita paréntesis. */
function precedence(node) {
  if (node.type === 'bin') {
    if (node.op === '+' || node.op === '-') return 1;
    if (node.op === '*') return 2;
    if (node.op === '^') return 5;
    return 6; // la fracción apilada se comporta como un bloque atómico
  }
  if (node.type === 'neg') return 2;
  return 6;
}

const isFraction = (node) => node.type === 'bin' && node.op === '/';

/** Primer nodo hoja que se dibuja a la izquierda de un subárbol. */
function firstLeaf(node) {
  if (node.type === 'bin' && node.op !== '/') return firstLeaf(node.left);
  return node;
}

/** Último nodo hoja que se dibuja a la derecha de un subárbol. */
function lastLeaf(node) {
  if (node.type === 'bin' && (node.op === '+' || node.op === '-' || node.op === '*')) return lastLeaf(node.right);
  return node;
}

/** Paréntesis que se estiran a la altura de su contenido. */
function Fenced({ children }) {
  return (
    <span className="math-row">
      <span className="math-fence math-fence-left" aria-hidden="true" />
      {children}
      <span className="math-fence math-fence-right" aria-hidden="true" />
    </span>
  );
}

/** Radical con barra superior (vinculum) y, opcionalmente, índice. */
function Radical({ index, children }) {
  return (
    <span className="math-row math-radical">
      {index ? <span className="math-root-index">{index}</span> : null}
      <span className="math-radical-sign" aria-hidden="true">
        <svg viewBox="0 0 10 20" preserveAspectRatio="none">
          <path d="M0.6 11.6 L2.7 10.4 L5.3 19.2 L9.5 0.75 L10 0.75" vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
      <span className="math-radicand">{children}</span>
    </span>
  );
}

function wrap(node, shouldWrap) {
  const inner = renderNode(node);
  return shouldWrap ? <Fenced>{inner}</Fenced> : inner;
}

function renderBinary(node) {
  const { op, left, right } = node;

  if (op === '/') {
    return (
      <span className="math-frac">
        <span className="math-frac-num">{renderNode(left)}</span>
        <span className="math-frac-den">{renderNode(right)}</span>
      </span>
    );
  }

  if (op === '^') {
    const wrapBase =
      precedence(left) < 6 ||
      isFraction(left) ||
      (left.type === 'call' && (RADICALS.has(left.name) || left.name === 'exp'));

    return (
      <span className="math-row math-power">
        {wrap(left, wrapBase)}
        <span className="math-sup">{renderNode(right)}</span>
      </span>
    );
  }

  if (op === '+' || op === '-') {
    const wrapRight = right.type === 'neg' || (op === '-' && precedence(right) <= 1);
    return (
      <span className="math-row">
        {renderNode(left)}
        <span className="math-op">{op === '+' ? '+' : '−'}</span>
        {wrap(right, wrapRight)}
      </span>
    );
  }

  // Producto: explícito (·) o yuxtapuesto (2x, 3(x+1)).
  const wrapLeft = precedence(left) < 2;
  const wrapRight = precedence(right) < 2 || right.type === 'neg';
  const first = firstLeaf(right);
  const showDot =
    !wrapRight &&
    (first.type === 'num' ||
      (isFraction(right) && lastLeaf(left).type === 'num') ||
      (!node.implicit && left.type !== 'num'));

  return (
    <span className="math-row">
      {wrap(left, wrapLeft)}
      {showDot ? <span className="math-op-tight">·</span> : <span className="math-thin" />}
      {wrap(right, wrapRight)}
    </span>
  );
}

function renderCall(node) {
  const [argument, second] = node.args;

  switch (node.name) {
    case 'sqrt':
      return <Radical>{renderNode(argument)}</Radical>;
    case 'cbrt':
      return <Radical index={<span className="math-num">3</span>}>{renderNode(argument)}</Radical>;
    case 'nroot':
    case 'root':
      return <Radical index={renderNode(second)}>{renderNode(argument)}</Radical>;
    case 'abs':
      return (
        <span className="math-row">
          <span className="math-bar" aria-hidden="true" />
          {renderNode(argument)}
          <span className="math-bar" aria-hidden="true" />
        </span>
      );
    case 'exp':
      return (
        <span className="math-row math-power">
          <span className="math-const">e</span>
          <span className="math-sup">{renderNode(argument)}</span>
        </span>
      );
    case 'log10':
      return (
        <span className="math-row">
          <span className="math-fn">log</span>
          <span className="math-sub">10</span>
          <Fenced>{renderNode(argument)}</Fenced>
        </span>
      );
    default:
      return (
        <span className="math-row">
          <span className="math-fn">{FUNCTION_LABELS[node.name] ?? node.name}</span>
          {INVERSE_TRIG.has(node.name) ? <span className="math-sup math-sup-fn">−1</span> : null}
          <Fenced>{renderNode(argument)}</Fenced>
        </span>
      );
  }
}

/** Convierte un nodo del AST en notación matemática bidimensional. */
function renderNode(node) {
  switch (node.type) {
    case 'num':
      return <span className="math-num">{node.raw}</span>;
    case 'var':
      return <span className="math-var">x</span>;
    case 'const':
      return <span className="math-const">{CONSTANT_LABELS[node.name] ?? node.name}</span>;
    case 'slot':
      return <span className="math-slot" />;
    case 'neg':
      return (
        <span className="math-row">
          <span className="math-op-tight">−</span>
          {wrap(node.arg, precedence(node.arg) <= 1 || node.arg.type === 'neg')}
        </span>
      );
    case 'bin':
      return renderBinary(node);
    case 'call':
      return renderCall(node);
    default:
      return null;
  }
}

/**
 * Vista previa matemática en tiempo real.
 *
 * Usa el mismo parser que el motor numérico (en modo tolerante), así que lo
 * que se ve es exactamente lo que se va a evaluar. Las partes por completar
 * aparecen como recuadros punteados.
 *
 * @param {object} props
 * @param {string} props.expression texto de la expresión
 * @param {string} [props.prefix] notación a la izquierda, p. ej. 'g(x) ='
 * @param {boolean} [props.compact=false] versión en línea para botones y chips
 */
export default function MathPreview({ expression, prefix = '', compact = false }) {
  const source = String(expression ?? '').trim();
  const parsed = useMemo(() => (source === '' ? null : parseExpressionAST(source)), [source]);

  if (compact) {
    if (!parsed?.ast) return <span className="font-mono text-[11px]">{source}</span>;
    return <span className="math-preview math-preview-compact">{renderNode(parsed.ast)}</span>;
  }

  if (source === '') {
    return <p className="py-1.5 text-sm text-slate-500 italic">La ecuación aparecerá aquí mientras escribe…</p>;
  }

  if (!parsed.ast) {
    return <p className="py-1.5 font-mono text-sm break-all text-rose-300">{source}</p>;
  }

  return (
    <div className="scrollbar-slim overflow-x-auto">
      <span className="math-preview" role="math" aria-label={source}>
        {prefix ? <span className="math-lhs">{prefix.replace(/'/g, '′')}</span> : null}
        {renderNode(parsed.ast)}
      </span>
    </div>
  );
}
