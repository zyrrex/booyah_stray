// Sistema de tipos del simulador: conversiones, aritmetica, comparacion y formato (reglas de T-SQL).

import { SqlError, type Cell, type Ty, type V } from './types'

export const INT: Ty = { k: 'int', n: 'int' }
export const NULLT: Ty = { k: 'null' }
export const BOOLT: Ty = { k: 'bool' }

export const NULLV: V = { t: NULLT, v: null }
export const intV = (n: number): V => ({ t: INT, v: n })
export const strV = (s: string | null): V => ({ t: { k: 'str', n: 'varchar', len: Math.max(1, (s ?? '').length) }, v: s })
export const boolV = (b: boolean | null): V => ({ t: BOOLT, v: b === null ? null : b ? 1 : 0 })

export function typeName(t: Ty): string {
  switch (t.k) {
    case 'int':
      return t.n
    case 'bit':
      return 'bit'
    case 'dec':
      return t.kw ?? 'decimal'
    case 'float':
      return 'float'
    case 'str':
      return t.n
    case 'date':
      return 'date'
    case 'datetime':
      return 'datetime'
    case 'bool':
      return 'bit'
    default:
      return 'int'
  }
}

/** Nombre completo para mostrar (varchar(50), decimal(10,2)...). */
export function typeFull(t: Ty): string {
  if (t.k === 'dec') return `decimal(${t.p},${t.s})`
  if (t.k === 'str') return `${t.n}(${t.len === Infinity ? 'max' : t.len})`
  return typeName(t)
}

const isNum = (t: Ty) => t.k === 'int' || t.k === 'bit' || t.k === 'dec' || t.k === 'float'
const isDate = (t: Ty) => t.k === 'date' || t.k === 'datetime'

export function decPS(t: Ty): { p: number; s: number } {
  switch (t.k) {
    case 'dec':
      return { p: t.p, s: t.s }
    case 'bit':
      return { p: 1, s: 0 }
    case 'int':
      return { p: t.n === 'tinyint' ? 3 : t.n === 'smallint' ? 5 : t.n === 'bigint' ? 19 : 10, s: 0 }
    default:
      return { p: 38, s: 0 }
  }
}

export function roundTo(x: number, s: number): number {
  const f = 10 ** s
  const r = Math.round((Math.abs(x) + Number.EPSILON * Math.abs(x)) * f) / f
  return x < 0 ? -r : r
}

// ---------------------------------------------------------------- texto <-> numero

const RE_INT = /^\s*[+-]?\d+\s*$/
const RE_NUM = /^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?\s*$/

function convFail(s: string, to: string): never {
  throw new SqlError(245, `Conversion failed when converting the varchar value '${s}' to data type ${to}.`, 16, 1)
}

/** texto -> numero segun el tipo destino (con los errores de SQL Server). */
function strToNumber(s: string, to: Ty): number {
  if (to.k === 'int' || to.k === 'bit') {
    if (!RE_INT.test(s)) convFail(s, typeName(to))
    return Number(s)
  }
  if (!RE_NUM.test(s)) throw new SqlError(8114, `Error converting data type varchar to ${to.k === 'float' ? 'float' : 'numeric'}.`, 16, 5)
  return Number(s)
}

// ---------------------------------------------------------------- fechas

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const p2 = (n: number) => String(n).padStart(2, '0')

export function parseDate(s: string, kind: 'date' | 'datetime'): string {
  const t = s.trim()
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/)
  if (!m) {
    const m2 = t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/) ?? t.match(/^(\d{4})(\d{2})(\d{2})$/)
    if (m2) m = m2 as unknown as RegExpMatchArray
  }
  const bad = () => {
    throw new SqlError(241, 'Conversion failed when converting date and/or time from character string.', 16, 1)
  }
  if (!m) return bad()
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const hh = Number(m[4] ?? 0)
  const mi = Number(m[5] ?? 0)
  const ss = Number(m[6] ?? 0)
  const ms = Number((m[7] ?? '0').padEnd(3, '0'))
  if (mo < 1 || mo > 12 || d < 1 || d > (mo === 2 && leap(y) ? 29 : DAYS[mo - 1]) || hh > 23 || mi > 59 || ss > 59 || y < 1753) return bad()
  const date = `${String(y).padStart(4, '0')}-${p2(mo)}-${p2(d)}`
  return kind === 'date' ? date : `${date} ${p2(hh)}:${p2(mi)}:${p2(ss)}.${String(ms).padStart(3, '0')}`
}

export function nowDatetime(): string {
  const d = new Date()
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

// ---------------------------------------------------------------- coleccion de texto (CI_AS)

const rtrim = (s: string) => s.replace(/\s+$/, '')
const baseKey = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Comparacion de texto como la intercalacion por defecto de SQL Server: sin distinguir mayusculas, con acentos. */
export function cmpStr(a: string, b: string): number {
  const ra = rtrim(a)
  const rb = rtrim(b)
  const x = baseKey(ra)
  const y = baseKey(rb)
  if (x < y) return -1
  if (x > y) return 1
  const la = ra.toLowerCase()
  const lb = rb.toLowerCase()
  return la < lb ? -1 : la > lb ? 1 : 0
}

/** Clave para agrupar / DISTINCT / UNIQUE (los textos se comparan sin distinguir mayusculas). */
export function eqKey(c: Cell): string {
  if (c === null) return 'null'
  if (typeof c === 'number') return `n:${c}`
  return `s:${rtrim(c).toLowerCase()}`
}

export function likeRegex(pat: string): RegExp {
  let re = ''
  for (let i = 0; i < pat.length; i++) {
    const c = pat[i]
    if (c === '%') re += '[\\s\\S]*'
    else if (c === '_') re += '[\\s\\S]'
    else if (c === '[') {
      const j = pat.indexOf(']', i + 1)
      if (j < 0) re += '\\['
      else {
        let set = pat.slice(i + 1, j)
        const neg = set.startsWith('^')
        if (neg) set = set.slice(1)
        re += `[${neg ? '^' : ''}${set.replace(/[\\\]]/g, '\\$&')}]`
        i = j
      }
    } else re += c.replace(/[.*+?^${}()|\\/]/g, '\\$&')
  }
  return new RegExp(`^${re}$`, 'i')
}

// ---------------------------------------------------------------- formato

export function fmtCell(c: Cell, t: Ty): string {
  if (c === null) return 'NULL'
  if (typeof c === 'string') return c
  if (t.k === 'dec') return (Object.is(c, -0) ? 0 : c).toFixed(t.s)
  if (t.k === 'float') return String(c)
  return String(c)
}

export const fmtV = (v: V) => fmtCell(v.v, v.t)

// ---------------------------------------------------------------- conversion a una columna

const INT_RANGE: Record<string, [number, number]> = {
  tinyint: [0, 255],
  smallint: [-32768, 32767],
  int: [-2147483648, 2147483647],
  bigint: [-9223372036854775808, 9223372036854775807],
}

export interface CoerceCtx {
  /** "Practica.dbo.Cliente" */
  table: string
  col: string
}

/** Convierte un valor al tipo de una columna (INSERT, UPDATE, ALTER COLUMN, CAST). */
export function coerce(val: V, to: Ty, ctx?: CoerceCtx): Cell {
  const { t, v } = val
  if (v === null) return null
  switch (to.k) {
    case 'int': {
      let n: number
      if (t.k === 'str') n = strToNumber(v as string, to)
      else if (t.k === 'date' || t.k === 'datetime') throw clash(t, to)
      else n = Math.trunc(v as number)
      const [lo, hi] = INT_RANGE[to.n]
      if (n < lo || n > hi) {
        if (to.n === 'int' || to.n === 'bigint') throw new SqlError(8115, `Arithmetic overflow error converting ${t.k === 'str' ? 'varchar' : 'expression'} to data type ${to.n}.`, 16, 2)
        throw new SqlError(220, `Arithmetic overflow error for data type ${to.n}, value = ${n}.`, 16, 1)
      }
      return n
    }
    case 'bit': {
      if (t.k === 'str') {
        const s = (v as string).trim().toLowerCase()
        if (s === 'true' || s === '1') return 1
        if (s === 'false' || s === '0') return 0
        convFail(v as string, 'bit')
      }
      if (t.k === 'date' || t.k === 'datetime') throw clash(t, to)
      return (v as number) !== 0 ? 1 : 0
    }
    case 'dec': {
      let n: number
      if (t.k === 'str') n = strToNumber(v as string, to)
      else if (t.k === 'date' || t.k === 'datetime') throw clash(t, to)
      else n = v as number
      const r = roundTo(n, to.s)
      if (Math.abs(r) >= 10 ** (to.p - to.s)) throw new SqlError(8115, 'Arithmetic overflow error converting numeric to data type numeric.', 16, 6)
      return r
    }
    case 'float': {
      if (t.k === 'str') return strToNumber(v as string, to)
      if (t.k === 'date' || t.k === 'datetime') throw clash(t, to)
      return v as number
    }
    case 'str': {
      let s: string
      if (t.k === 'str' || isDate(t)) s = v as string
      else s = fmtCell(v, t)
      const r = rtrim(s)
      if (to.len !== Infinity && r.length > to.len) {
        const where = ctx ? ` in table '${ctx.table}', column '${ctx.col}'` : ''
        throw new SqlError(8152, `String or binary data would be truncated${where}. Truncated value: '${s.slice(0, to.len)}'.`, 16, 30)
      }
      return to.n === 'char' || to.n === 'nchar' ? r.padEnd(to.len === Infinity ? 0 : to.len, ' ') : s
    }
    case 'date':
    case 'datetime': {
      if (t.k === 'str') return parseDate(v as string, to.k)
      if (isDate(t)) {
        const s = v as string
        if (to.k === 'date') return s.slice(0, 10)
        return t.k === 'date' ? `${s} 00:00:00.000` : s
      }
      throw clash(t, to)
    }
    default:
      return v
  }
}

function clash(a: Ty, b: Ty) {
  return new SqlError(206, `Operand type clash: ${typeName(a)} is incompatible with ${typeName(b)}`, 16, 2)
}

// ---------------------------------------------------------------- comparacion

/** -1/0/1 o null (desconocido) si alguno es NULL. */
export function compare(a: V, b: V): number | null {
  if (a.v === null || b.v === null) return null
  const ta = a.t
  const tb = b.t
  if (ta.k === 'str' && tb.k === 'str') return cmpStr(a.v as string, b.v as string)
  if (isDate(ta) || isDate(tb)) {
    const kind = ta.k === 'datetime' || tb.k === 'datetime' ? 'datetime' : 'date'
    const conv = (x: V) => {
      if (x.t.k === 'str') return parseDate(x.v as string, kind)
      if (isDate(x.t)) return coerce(x, kind === 'date' ? { k: 'date' } : { k: 'datetime' }) as string
      throw clash(x.t, kind === 'date' ? { k: 'date' } : { k: 'datetime' })
    }
    const x = conv(a)
    const y = conv(b)
    return x < y ? -1 : x > y ? 1 : 0
  }
  if (ta.k === 'bool' || tb.k === 'bool') {
    const x = Number(a.v)
    const y = Number(b.v)
    return x < y ? -1 : x > y ? 1 : 0
  }
  // numericos (y texto que se convierte al tipo del otro lado)
  let x: number
  let y: number
  if (ta.k === 'str') {
    x = strToNumber(a.v as string, tb)
    y = b.v as number
  } else if (tb.k === 'str') {
    x = a.v as number
    y = strToNumber(b.v as string, ta)
  } else {
    x = a.v as number
    y = b.v as number
  }
  return x < y ? -1 : x > y ? 1 : 0
}

// ---------------------------------------------------------------- aritmetica

const MAXP = 38

function fitDec(p: number, s: number): { p: number; s: number } {
  if (p > MAXP) {
    s = Math.max(s - (p - MAXP), Math.min(s, 6))
    p = MAXP
  }
  return { p, s }
}

export function arith(op: '+' | '-' | '*' | '/' | '%', a: V, b: V): V {
  // concatenacion de texto
  if (op === '+' && a.t.k === 'str' && b.t.k === 'str') {
    if (a.v === null || b.v === null) return { t: { k: 'str', n: 'varchar', len: 8000 }, v: null }
    const n = a.t.n === 'nvarchar' || a.t.n === 'nchar' || b.t.n === 'nvarchar' || b.t.n === 'nchar' ? 'nvarchar' : 'varchar'
    const s = (a.t.n === 'char' || a.t.n === 'nchar' ? (a.v as string) : (a.v as string)) + (b.v as string)
    return { t: { k: 'str', n, len: Math.max(1, s.length) }, v: s }
  }
  if (op === '+' && ((a.t.k === 'str' && b.t.k === 'null') || (a.t.k === 'null' && b.t.k === 'str'))) return { t: { k: 'str', n: 'varchar', len: 8000 }, v: null }
  if (isDate(a.t) || isDate(b.t)) throw clash(isDate(a.t) ? a.t : b.t, INT)
  if (a.t.k === 'bool' || b.t.k === 'bool') throw clash(BOOLT, INT)

  // el texto se convierte al tipo del otro operando (precedencia de tipos)
  let ta: Ty = a.t
  let tb: Ty = b.t
  let x = a.v
  let y = b.v
  if (ta.k === 'str' && tb.k === 'str') {
    // ambos texto con operador distinto de +: se intentan como numeros
    if (x !== null) x = RE_INT.test(x as string) ? Number(x) : strToNumber(x as string, { k: 'float' })
    if (y !== null) y = RE_INT.test(y as string) ? Number(y) : strToNumber(y as string, { k: 'float' })
    ta = RE_INT.test(String(a.v)) ? INT : { k: 'float' }
    tb = RE_INT.test(String(b.v)) ? INT : { k: 'float' }
  } else if (ta.k === 'str') {
    const target = tb.k === 'null' ? INT : tb
    if (x !== null) x = strToNumber(x as string, target)
    ta = target.k === 'bit' ? INT : target
  } else if (tb.k === 'str') {
    const target = ta.k === 'null' ? INT : ta
    if (y !== null) y = strToNumber(y as string, target)
    tb = target.k === 'bit' ? INT : target
  }
  if (ta.k === 'null') ta = tb.k === 'null' ? INT : tb
  if (tb.k === 'null') tb = ta

  const nullResult = x === null || y === null
  const bothInt = (ta.k === 'int' || ta.k === 'bit') && (tb.k === 'int' || tb.k === 'bit')

  if (ta.k === 'float' || tb.k === 'float') {
    if (nullResult) return { t: { k: 'float' }, v: null }
    const m = x as number
    const n = y as number
    if ((op === '/' || op === '%') && n === 0) throw new SqlError(8134, 'Divide by zero error encountered.', 16, 1)
    const r = op === '+' ? m + n : op === '-' ? m - n : op === '*' ? m * n : op === '/' ? m / n : m % n
    return { t: { k: 'float' }, v: r }
  }

  if (bothInt) {
    const big = (ta.k === 'int' && ta.n === 'bigint') || (tb.k === 'int' && tb.n === 'bigint')
    const rt: Ty = { k: 'int', n: big ? 'bigint' : 'int' }
    if (nullResult) return { t: rt, v: null }
    const m = x as number
    const n = y as number
    if ((op === '/' || op === '%') && n === 0) throw new SqlError(8134, 'Divide by zero error encountered.', 16, 1)
    const r = op === '+' ? m + n : op === '-' ? m - n : op === '*' ? m * n : op === '/' ? Math.trunc(m / n) : m % n
    if (!big && (r > 2147483647 || r < -2147483648)) throw new SqlError(8115, 'Arithmetic overflow error converting expression to data type int.', 16, 2)
    return { t: rt, v: r }
  }

  // decimales
  const A = decPS(ta)
  const B = decPS(tb)
  let p: number
  let s: number
  switch (op) {
    case '+':
    case '-':
      s = Math.max(A.s, B.s)
      p = Math.max(A.s, B.s) + Math.max(A.p - A.s, B.p - B.s) + 1
      break
    case '*':
      s = A.s + B.s
      p = A.p + B.p + 1
      break
    case '/':
      s = Math.max(6, A.s + B.p + 1)
      p = A.p - A.s + B.s + s
      break
    default:
      s = Math.max(A.s, B.s)
      p = Math.min(A.p - A.s, B.p - B.s) + s
  }
  const fit = fitDec(p, s)
  const rt: Ty = { k: 'dec', p: fit.p, s: fit.s }
  if (nullResult) return { t: rt, v: null }
  const m = x as number
  const n = y as number
  if ((op === '/' || op === '%') && n === 0) throw new SqlError(8134, 'Divide by zero error encountered.', 16, 1)
  const r = op === '+' ? m + n : op === '-' ? m - n : op === '*' ? m * n : op === '/' ? m / n : m % n
  return { t: rt, v: roundTo(r, fit.s) }
}

/** Tipo "mas fuerte" entre dos tipos (para COALESCE y similares). */
export function higherType(a: Ty, b: Ty): Ty {
  const rank = (t: Ty) => (t.k === 'null' ? -1 : t.k === 'str' ? 0 : t.k === 'bit' ? 1 : t.k === 'int' ? 2 : t.k === 'dec' ? 3 : t.k === 'float' ? 4 : t.k === 'date' ? 5 : t.k === 'datetime' ? 6 : 0)
  return rank(b) > rank(a) ? b : a
}
