// ─── Runtime helpers injected into every execution ───────────────────────────

const RUNTIME = `
  function __pyrepr(v) {
    if (v === true)  return 'True';
    if (v === false) return 'False';
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'string') return "'" + v.replace(/\\\\/g,'\\\\\\\\').replace(/'/g,"\\\\'") + "'";
    if (v instanceof Set)  return '{' + [...v].map(__pyrepr).join(', ') + '}';
    if (Array.isArray(v))  return '[' + v.map(__pyrepr).join(', ') + ']';
    if (typeof v === 'object') {
      return '{' + Object.entries(v).map(([k,vv]) => "'" + k + "': " + __pyrepr(vv)).join(', ') + '}';
    }
    return String(v);
  }
  function __pystr(v) {
    if (v === true)  return 'True';
    if (v === false) return 'False';
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'string') return v;
    return __pyrepr(v);
  }
  function __print(...args) { __out.push(args.map(__pystr).join(' ')); }
  function __len(x) {
    if (x instanceof Set || x instanceof Map) return x.size;
    if (x != null && x.length !== undefined) return x.length;
    return 0;
  }
  function __range(a, b, step) {
    if (b === undefined) { b = a; a = 0; }
    if (step === undefined) step = 1;
    const r = [];
    if (step > 0) for (let i = a; i < b; i += step) r.push(i);
    else          for (let i = a; i > b; i += step) r.push(i);
    return r;
  }
  function __sorted(x, reverse) {
    const arr = [...x];
    arr.sort((a, b) => {
      if (a > b) return reverse ? -1 :  1;
      if (a < b) return reverse ?  1 : -1;
      return 0;
    });
    return arr;
  }
  function __int(x)   { const n = parseInt(String(x), 10); if (isNaN(n)) throw new Error('ValueError'); return n; }
  function __float(x) { const n = parseFloat(String(x));   if (isNaN(n)) throw new Error('ValueError'); return n; }
  function __set(x)   { return new Set(x); }
  function __abs(x)   { return Math.abs(x); }
  function __max(...a){ return a.length===1&&Array.isArray(a[0]) ? Math.max(...a[0]) : Math.max(...a); }
  function __min(...a){ return a.length===1&&Array.isArray(a[0]) ? Math.min(...a[0]) : Math.min(...a); }
  function __sum(x)   { return [...x].reduce((a,b) => a+b, 0); }
  function __type(x) {
    if (x===null||x===undefined) return "<class 'NoneType'>";
    if (typeof x==='boolean')    return "<class 'bool'>";
    if (Number.isInteger(x))     return "<class 'int'>";
    if (typeof x==='number')     return "<class 'float'>";
    if (typeof x==='string')     return "<class 'str'>";
    if (Array.isArray(x))        return "<class 'list'>";
    if (x instanceof Set)        return "<class 'set'>";
    return "<class 'dict'>";
  }
`;

// ─── Comment stripper ─────────────────────────────────────────────────────────

function stripComments(code) {
  return code.split('\n').map(line => {
    let inS = false, inD = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i], prev = line[i-1] || '';
      if (ch === "'" && !inD && prev !== '\\') inS = !inS;
      else if (ch === '"' && !inS && prev !== '\\') inD = !inD;
      else if (ch === '#' && !inS && !inD) return line.slice(0, i);
    }
    return line;
  }).join('\n');
}

// ─── Apply transform only to non-string parts of an expression ───────────────

function transformNonStrings(expr, fn) {
  // Splits on string literals (single/double/backtick), applies fn to gaps
  let result = '';
  let i = 0;
  let segStart = 0;

  while (i < line_length(expr)) {
    const ch = expr[i];
    const prev = expr[i-1] || '';

    // Detect start of a string literal
    if ((ch === "'" || ch === '"') && prev !== '\\') {
      // Flush non-string segment
      result += fn(expr.slice(segStart, i));
      const quote = ch;
      let j = i + 1;
      // Find closing quote (simple, doesn't handle triple-quotes for our purposes)
      while (j < expr.length) {
        if (expr[j] === quote && expr[j-1] !== '\\') { j++; break; }
        j++;
      }
      result += expr.slice(i, j); // include the string literal verbatim
      i = j;
      segStart = i;
      continue;
    }
    // Backtick strings (already-converted template literals)
    if (ch === '`') {
      result += fn(expr.slice(segStart, i));
      let j = i + 1;
      let depth = 0;
      while (j < expr.length) {
        if (expr[j] === '$' && expr[j+1] === '{') { depth++; j += 2; continue; }
        if (expr[j] === '{') { depth++; }
        if (expr[j] === '}') { depth--; }
        if (expr[j] === '`' && depth <= 0) { j++; break; }
        j++;
      }
      result += expr.slice(i, j);
      i = j;
      segStart = i;
      continue;
    }
    i++;
  }
  result += fn(expr.slice(segStart));
  return result;
}

// Tiny helper because closures refer to it
function line_length(s) { return s.length; }

// ─── Expression transformer ───────────────────────────────────────────────────

function transformExpr(expr, ctx) {
  let e = expr;

  // ── f-strings — recursive inner transform ──
  e = e.replace(/f"((?:[^"\\]|\\.)*)"/g, (_, c) =>
    '`' + c.replace(/\{([^}]+)\}/g, (__, inner) => '${' + transformExpr(inner.trim(), ctx) + '}') + '`');
  e = e.replace(/f'((?:[^'\\]|\\.)*)'/g, (_, c) =>
    '`' + c.replace(/\{([^}]+)\}/g, (__, inner) => '${' + transformExpr(inner.trim(), ctx) + '}') + '`');

  // ── Booleans / None (must come before keyword replacements) ──
  e = transformNonStrings(e, s =>
    s.replace(/\bTrue\b/g, 'true')
     .replace(/\bFalse\b/g, 'false')
     .replace(/\bNone\b/g, 'null')
  );

  // ── Logical keywords — only outside strings ──
  e = transformNonStrings(e, s =>
    s.replace(/\bnot\s+/g, '!')
     .replace(/\band\b/g,  '&&')
     .replace(/\bor\b/g,   '||')
  );

  // ── print() ──
  e = e.replace(/\bprint\s*\(/g, '__print(');

  // ── Built-in functions ──
  e = e.replace(/\blen\s*\(/g,   '__len(');
  e = e.replace(/\bint\s*\(/g,   '__int(');
  e = e.replace(/\bfloat\s*\(/g, '__float(');
  e = e.replace(/\bstr\s*\(/g,   '__pystr(');
  e = e.replace(/\babs\s*\(/g,   '__abs(');
  e = e.replace(/\bmax\s*\(/g,   '__max(');
  e = e.replace(/\bmin\s*\(/g,   '__min(');
  e = e.replace(/\bsum\s*\(/g,   '__sum(');
  e = e.replace(/\btype\s*\(/g,  '__type(');
  e = e.replace(/\bset\s*\(/g,   '__set(');
  e = e.replace(/\brange\s*\(/g, '__range(');

  // ── sorted() ──
  e = e.replace(/\bsorted\s*\(\s*(\w+)\.keys\s*\(\s*\)\s*\)/g,
    (_, d) => `__sorted(Object.keys(${d}))`);
  e = e.replace(/\bsorted\s*\(\s*(\w+)\.values\s*\(\s*\)\s*\)/g,
    (_, d) => `__sorted(Object.values(${d}))`);
  // reverse=True/False (True already → true at this point)
  e = e.replace(/\bsorted\s*\(([^,)]+),\s*reverse\s*=\s*true\s*\)/gi,
    (_, x) => `__sorted(${transformExpr(x.trim(), ctx)}, true)`);
  e = e.replace(/\bsorted\s*\(([^,)]+),\s*reverse\s*=\s*false\s*\)/gi,
    (_, x) => `__sorted(${transformExpr(x.trim(), ctx)}, false)`);
  e = e.replace(/\bsorted\s*\(/g, '__sorted(');

  // ── list(filter/map) ──
  e = e.replace(/\blist\s*\(\s*filter\s*\(([^,]+),\s*([^)]+)\)\s*\)/g,
    (_, fn, it) => `[...${transformExpr(it.trim(), ctx)}].filter(${transformExpr(fn.trim(), ctx)})`);
  e = e.replace(/\blist\s*\(\s*map\s*\(([^,]+),\s*([^)]+)\)\s*\)/g,
    (_, fn, it) => `[...${transformExpr(it.trim(), ctx)}].map(${transformExpr(fn.trim(), ctx)})`);
  e = e.replace(/\blist\s*\(/g, 'Array.from(');

  // ── filter / map standalone ──
  e = e.replace(/\bfilter\s*\(([^,]+),\s*([^)]+)\)/g,
    (_, fn, it) => `[...${it.trim()}].filter(${fn.trim()})`);
  e = e.replace(/\bmap\s*\(([^,]+),\s*([^)]+)\)/g,
    (_, fn, it) => `[...${it.trim()}].map(${fn.trim()})`);

  // ── dict methods ──
  e = e.replace(/(\w+)\.keys\s*\(\s*\)/g,   'Object.keys($1)');
  e = e.replace(/(\w+)\.values\s*\(\s*\)/g, 'Object.values($1)');
  e = e.replace(/(\w+)\.items\s*\(\s*\)/g,  'Object.entries($1)');

  // ── String / list methods ──
  e = e.replace(/\.upper\s*\(\)/g,  '.toUpperCase()');
  e = e.replace(/\.lower\s*\(\)/g,  '.toLowerCase()');
  e = e.replace(/\.strip\s*\(\)/g,  '.trim()');
  e = e.replace(/\.lstrip\s*\(\)/g, '.trimStart()');
  e = e.replace(/\.rstrip\s*\(\)/g, '.trimEnd()');
  e = e.replace(/\.append\s*\(/g,   '.push(');
  e = e.replace(/\.extend\s*\(([^)]+)\)/g, '.push(...$1)');
  e = e.replace(/\.pop\s*\(\s*\)/g, '.pop()');
  e = e.replace(/\.reverse\s*\(\s*\)/g, '.reverse()');
  e = e.replace(/\.split\s*\(/g,    '.split(');
  e = e.replace(/\.join\s*\(/g,     '.join(');
  e = e.replace(/\.startswith\s*\(/g, '.startsWith(');
  e = e.replace(/\.endswith\s*\(/g,   '.endsWith(');
  e = e.replace(/\.replace\s*\(([^,]+),\s*([^)]+)\)/g,
    (_, old, nw) => `.split(${old}).join(${nw})`);

  // .sort() — True/False already lowercased at this point in the pipeline
  e = e.replace(/\.sort\s*\(\s*reverse\s*=\s*true\s*\)/gi,
    '.sort((a,b) => a>b?-1:a<b?1:0)');
  e = e.replace(/\.sort\s*\(\s*reverse\s*=\s*false\s*\)/gi,
    '.sort((a,b) => a>b?1:a<b?-1:0)');
  e = e.replace(/\.sort\s*\(\s*\)/g,
    '.sort((a,b) => a>b?1:a<b?-1:0)');
  // NOTE: intentionally NO catch-all .sort([^)]+) here — it would double-fire
  // on the already-generated arrow function body and corrupt the output.

  // ── Python slice notation: x[start:stop:step] ──
  // Full: x[a:b:c]
  e = e.replace(/(\w+)\[(-?\d*):(-?\d*):(-?\d+)\]/g, (_, v, a, b, step) => {
    const sa = a || '0', sb = b ? `, ${b}` : '';
    return `__range(${sa}, ${v}.length${sb ? ',' + sb.slice(2) : ''}, ${step}).map(i => ${v}[i])`;
  });
  // x[a:b]
  e = e.replace(/(\w+)\[(-?\d*):(-?\d*)\]/g, (_, v, a, b) => {
    if (!a && !b) return v;
    if (!a) return `${v}.slice(0, ${b})`;
    if (!b) return `${v}.slice(${a})`;
    return `${v}.slice(${a}, ${b})`;
  });

  // ── Python tuple literals: (a, b, ...) → [a, b, ...] ──
  // Negative lookbehind: not a function call (preceded by identifier)
  // Negative lookahead: not arrow function params (followed by =>)
  e = e.replace(/(?<![a-zA-Z0-9_])\((\s*[^()]+(?:,[^()]+)+)\s*\)(?!\s*=>)/g, (match, content) => {
    if (/^\s*\w+\s+if\s+/.test(content)) return match; // ternary / conditional
    return `[${content}]`;
  });

  // ── lambda ──
  e = e.replace(/\blambda\s+([^:]+)\s*:\s*(.+)/g, (_, params, body) =>
    `(${params.trim()}) => ${transformExpr(body.trim(), ctx)}`);

  // ── self. → this. ──
  e = e.replace(/\bself\./g, 'this.');

  // ── List comprehension: [expr for var in range(a,b)] ──
  e = e.replace(/\[(.+?)\s+for\s+(\w+)\s+in\s+__range\(([^)]+)\)(?:\s+if\s+([^\]]+))?\]/g,
    (_, expr, v, rangeArgs, cond) => {
      const mapped = `__range(${rangeArgs}).map((${v}) => ${transformExpr(expr, ctx)})`;
      return cond ? `${mapped}.filter((${v}) => ${transformExpr(cond, ctx)})` : mapped;
    });

  // ── List comprehension: [expr for var in iterable] ──
  e = e.replace(/\[(.+?)\s+for\s+(\w+)\s+in\s+([^\]]+?)(?:\s+if\s+([^\]]+))?\]/g,
    (_, expr, v, it, cond) => {
      const itJS = transformExpr(it.trim(), ctx);
      const exprJS = transformExpr(expr, ctx);
      if (cond) {
        const condJS = transformExpr(cond, ctx);
        return `[...${itJS}].filter((${v}) => ${condJS}).map((${v}) => ${exprJS})`;
      }
      return `[...${itJS}].map((${v}) => ${exprJS})`;
    });

  // ── Class instantiation: ClassName(...) → new ClassName(...) ──
  if (ctx && ctx.classNames && ctx.classNames.size > 0) {
    for (const cn of ctx.classNames) {
      // Only replace bare calls, not ones already prefixed with `new`
      const re = new RegExp(`(?<!new\\s)\\b${cn}\\s*\\(`, 'g');
      e = e.replace(re, `new ${cn}(`);
    }
  }

  return e;
}

// ─── Line-level transformer ───────────────────────────────────────────────────

function transformLine(trimmed, ctx) {
  // class definition
  {
    const m = trimmed.match(/^class\s+(\w+)(?:\([^)]*\))?\s*:$/);
    if (m) {
      ctx.classNames.add(m[1]);
      return { js: `class ${m[1]} {`, opensBlock: true, blockType: 'class' };
    }
  }

  // def (method or function)
  if (/^def\s+/.test(trimmed)) {
    const m = trimmed.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/);
    if (m) {
      let name = m[1], rawParams = m[2];
      const parentIsClass = ctx.blockStack.length > 0 &&
        ctx.blockStack[ctx.blockStack.length - 1].blockType === 'class';

      if (parentIsClass) {
        // Strip 'self' from param list
        const params = rawParams
          .replace(/^\s*self\s*,?\s*/, '')
          .replace(/,?\s*self\s*$/, '')
          .trim();
        if (name === '__init__') name = 'constructor';
        return { js: `${name}(${params}) {`, opensBlock: true, blockType: 'function' };
      }
      return { js: `function ${name}(${rawParams}) {`, opensBlock: true, blockType: 'function' };
    }
  }

  // while
  {
    const m = trimmed.match(/^while\s+(.+)\s*:$/);
    if (m) {
      return { js: `while (${transformExpr(m[1].trim(), ctx)}) {`, opensBlock: true, blockType: 'other' };
    }
  }

  // for ... in range(...)
  {
    const m = trimmed.match(/^for\s+(\w+)\s+in\s+range\s*\(([^)]+)\)\s*:$/);
    if (m) {
      const v = m[1];
      const args = m[2].split(',').map(s => s.trim());
      let start = '0', stop = args[0], step = '1';
      if (args.length >= 2) { start = args[0]; stop = args[1]; }
      if (args.length >= 3) { step = args[2]; }
      return {
        js: `for (let ${v} = ${start}; ${v} < ${stop}; ${v} += ${step}) {`,
        opensBlock: true, blockType: 'other',
      };
    }
  }

  // for ... in iterable
  {
    const m = trimmed.match(/^for\s+(\w+)\s+in\s+(.+)\s*:$/);
    if (m) {
      const v = m[1];
      const it = transformExpr(m[2].trim(), ctx);
      return { js: `for (const ${v} of ${it}) {`, opensBlock: true, blockType: 'other' };
    }
  }

  // if
  {
    const m = trimmed.match(/^if\s+(.+)\s*:$/);
    if (m) {
      return { js: `if (${transformExpr(m[1].trim(), ctx)}) {`, opensBlock: true, blockType: 'other' };
    }
  }

  // try
  if (trimmed === 'try:') return { js: 'try {', opensBlock: true, blockType: 'other' };

  // pass
  if (trimmed === 'pass') return { js: '/* pass */', opensBlock: false };

  // break / continue
  if (trimmed === 'break')    return { js: 'break;',    opensBlock: false };
  if (trimmed === 'continue') return { js: 'continue;', opensBlock: false };

  // return
  {
    const m = trimmed.match(/^return(?:\s+(.+))?$/);
    if (m) {
      return { js: `return ${m[1] ? transformExpr(m[1].trim(), ctx) : ''};`, opensBlock: false };
    }
  }

  // raise
  if (/^raise\s+/.test(trimmed)) {
    return { js: `throw new Error('${trimmed.slice(6).trim()}');`, opensBlock: false };
  }

  // General expression / assignment
  return { js: transformExpr(trimmed, ctx), opensBlock: false };
}

// ─── Main transpiler ──────────────────────────────────────────────────────────

function transpile(code) {
  const lines = stripComments(code).split('\n');

  const ctx = {
    classNames: new Set(),
    blockStack: [],
  };

  // Pre-scan class names so instantiation can be rewritten
  for (const line of lines) {
    const m = line.match(/^\s*class\s+(\w+)/);
    if (m) ctx.classNames.add(m[1]);
  }

  const output = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trimStart();
    if (!trimmed) continue;

    const indent = rawLine.length - trimmed.length;

    // ── Continuation lines (else / elif / except / finally) ──
    const isContinuation =
      trimmed === 'else:' ||
      /^elif\s+.+:$/.test(trimmed) ||
      /^except(\s+[\w,\s]+)?(\s+as\s+\w+)?\s*:$/.test(trimmed) ||
      trimmed === 'finally:';

    if (isContinuation) {
      // Close blocks that are deeper than us
      while (ctx.blockStack.length && ctx.blockStack[ctx.blockStack.length - 1].indent > indent) {
        ctx.blockStack.pop();
        output.push(' '.repeat(indent) + '}');
      }

      if (trimmed === 'else:') {
        output.push(' '.repeat(indent) + '} else {');
      } else if (/^elif\s+/.test(trimmed)) {
        const cond = transformExpr(trimmed.slice(5, -1).trim(), ctx);
        output.push(' '.repeat(indent) + `} else if (${cond}) {`);
      } else if (/^except/.test(trimmed)) {
        const asMatch = trimmed.match(/\bas\s+(\w+)/);
        const errVar = asMatch ? asMatch[1] : '__pyErr';
        output.push(' '.repeat(indent) + `} catch (${errVar}) {`);
      } else if (trimmed === 'finally:') {
        output.push(' '.repeat(indent) + '} finally {');
      }
      // Keep the existing blockStack entry — it now represents the continuation block
      continue;
    }

    // ── Close blocks at or deeper than current indent ──
    while (ctx.blockStack.length && ctx.blockStack[ctx.blockStack.length - 1].indent >= indent) {
      const closed = ctx.blockStack.pop();
      output.push(' '.repeat(closed.indent) + '}');
    }

    // ── Transform and emit ──
    const { js, opensBlock, blockType } = transformLine(trimmed, ctx);
    output.push(' '.repeat(indent) + js);

    if (opensBlock) {
      ctx.blockStack.push({ indent, blockType: blockType || 'other' });
    }
  }

  // Close any remaining open blocks
  while (ctx.blockStack.length) {
    const closed = ctx.blockStack.pop();
    output.push(' '.repeat(closed.indent) + '}');
  }

  return output.join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function runPython(code) {
  if (!code || !code.trim()) return '';
  try {
    const js = transpile(code.trim());
    const outputs = [];
    // eslint-disable-next-line no-new-func
    const fn = new Function('__out', RUNTIME + '\n' + js);
    fn(outputs);
    return outputs.join('\n');
  } catch (_) {
    return '';
  }
}

export function runPythonDebug(code) {
  const js = transpile((code || '').trim());
  const output = runPython(code);
  return { js, output };
}
