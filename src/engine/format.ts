// Formateo de salida estilo Node (console.log) y traduccion de errores a lenguaje claro.
// Lo usan el worker del navegador y el validador en Node, para que ambos coincidan.

const IDENT = /^[A-Za-z_$][\w$]*$/

export function inspect(v: unknown, depth = 0): string {
  if (typeof v === 'string') return depth === 0 ? v : `'${v.replace(/'/g, "\\'")}'`
  if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v)
  if (v === null || v === undefined || typeof v === 'boolean' || typeof v === 'bigint') return String(v)
  if (typeof v === 'function') return `[Function: ${(v as { name?: string }).name || '(anonymous)'}]`
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    if (depth > 2) return '[Array]'
    const items = v.map((x) => inspect(x, depth + 1))
    return wrap('[', ']', items, depth)
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v as object)
    if (keys.length === 0) return '{}'
    if (depth > 2) return '[Object]'
    const items = keys.map((k) => `${IDENT.test(k) ? k : `'${k}'`}: ${inspect((v as Record<string, unknown>)[k], depth + 1)}`)
    return wrap('{', '}', items, depth)
  }
  return String(v)
}

function wrap(open: string, close: string, items: string[], depth: number): string {
  const one = `${open} ${items.join(', ')} ${close}`
  if (one.length <= 72 && !one.includes('\n')) return one
  const pad = '  '.repeat(depth + 1)
  return `${open}\n${items.map((i) => pad + i).join(',\n')}\n${'  '.repeat(depth)}${close}`
}

export function formatArgs(args: unknown[]): string {
  return args.map((a) => inspect(a)).join(' ')
}

/** Representacion "de codigo" de un valor (los textos van con comillas dobles). Para respuestas. */
export function repr(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v)
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN'
  if (Array.isArray(v) || (v && typeof v === 'object')) return inspect(v, 1)
  return String(v)
}

export interface RunError {
  name: string
  message: string
}

/** Pista en espanol para los errores mas comunes de principiante. */
export function friendlyError(err: RunError): string {
  const m = err.message
  let hint = ''
  if (/is not defined/.test(m)) {
    const name = m.split(' ')[0]
    hint = `No existe "${name}". Revisa que la escribiste igual que donde la declaraste (mayusculas y sin tildes) y que esta dentro de su alcance (scope): una variable creada dentro de { } no existe afuera.`
  } else if (/already been declared/.test(m)) {
    hint = 'Declaraste dos veces el mismo nombre. Los datos del ejercicio ya estan declarados: no los vuelvas a escribir con let/const; solo usalos.'
  } else if (/Assignment to constant variable/.test(m)) {
    hint = 'Intentaste reasignar una constante (const). Si necesitas cambiar su valor, debe declararse con let.'
  } else if (/Cannot read properties of undefined/.test(m)) {
    hint = 'Pediste una propiedad o posicion de algo que no existe (undefined). Revisa el indice o la ruta: apuntaste a un elemento inexistente.'
  } else if (/Unexpected end of input/.test(m)) {
    hint = 'Falta cerrar algo: una llave }, un parentesis ) o unas comillas.'
  } else if (/Unexpected token|Invalid or unexpected token|missing \)|Unexpected identifier|Unexpected string/.test(m)) {
    hint = 'Hay un simbolo fuera de lugar. Revisa llaves { }, parentesis ( ), comillas y que cada if/for tenga su forma: instruccion (condicion) { acciones }.'
  } else if (/is not a function/.test(m)) {
    hint = 'Llamaste como funcion algo que no lo es. Revisa el nombre y los parentesis.'
  } else if (/before initialization/.test(m)) {
    hint = 'Usaste una variable antes de declararla. Declarala primero (las lineas se ejecutan en orden).'
  }
  return hint ? `${err.name}: ${m}\n${hint}` : `${err.name}: ${m}`
}

export function normLines(lines: string[]): string[] {
  const out = lines.map((l) => l.replace(/\s+$/g, ''))
  while (out.length && out[out.length - 1] === '') out.pop()
  return out
}

/** Normaliza una respuesta escrita a mano para compararla. */
export function normAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[“”«»]/g, '"')
    .replace(/'/g, '"')
    .replace(/\s+/g, '')
    .replace(/^verdadero$/, 'true')
    .replace(/^falso$/, 'false')
}
