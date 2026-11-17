// Lexer + parser del subconjunto de T-SQL del curso. Un error de sintaxis detiene TODO el lote (como en SSMS).

import { SqlError, type ColDef, type Expr, type SelectItem, type SelectStmt, type Stmt, type TableConstraint, type TableName, type Ty } from './types'

// ---------------------------------------------------------------- lexer

type TokKind = 'id' | 'bid' | 'num' | 'str' | 'op' | 'eof'

export interface Tok {
  t: TokKind
  v: string
  up: string
  line: number
  /** N'...' */
  n?: boolean
}

const OPS3 = ['<>', '!=', '<=', '>=']

export function lex(src: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  let line = 1
  const n = src.length
  while (i < n) {
    const c = src[i]
    if (c === '\n') {
      line++
      i++
      continue
    }
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (c === '-' && src[i + 1] === '-') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++
        i++
      }
      i += 2
      continue
    }
    // cadenas  'texto'  /  N'texto'
    if (c === "'" || ((c === 'N' || c === 'n') && src[i + 1] === "'")) {
      const isN = c !== "'"
      const startLine = line
      i += isN ? 2 : 1
      let s = ''
      let closed = false
      while (i < n) {
        if (src[i] === "'") {
          if (src[i + 1] === "'") {
            s += "'"
            i += 2
            continue
          }
          closed = true
          i++
          break
        }
        if (src[i] === '\n') line++
        s += src[i]
        i++
      }
      if (!closed) throw new SqlError(105, `Unclosed quotation mark after the character string '${s.slice(0, 40)}'.`, 15, 1, true, [], startLine)
      toks.push({ t: 'str', v: s, up: s, line: startLine, n: isN })
      continue
    }
    // [identificador] / "identificador"
    if (c === '[' || c === '"') {
      const close = c === '[' ? ']' : '"'
      let j = i + 1
      let s = ''
      while (j < n && src[j] !== close) {
        s += src[j]
        j++
      }
      if (j >= n) throw new SqlError(105, `Unclosed quotation mark after the character string '${s.slice(0, 40)}'.`, 15, 1, true, [], line)
      toks.push({ t: 'bid', v: s, up: s.toUpperCase(), line })
      i = j + 1
      continue
    }
    // numeros
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i
      while (j < n && /[0-9]/.test(src[j])) j++
      if (src[j] === '.') {
        j++
        while (j < n && /[0-9]/.test(src[j])) j++
      }
      if ((src[j] === 'e' || src[j] === 'E') && /[0-9+-]/.test(src[j + 1] ?? '')) {
        j++
        if (src[j] === '+' || src[j] === '-') j++
        while (j < n && /[0-9]/.test(src[j])) j++
      }
      const text = src.slice(i, j)
      toks.push({ t: 'num', v: text, up: text, line })
      i = j
      continue
    }
    // identificadores y palabras clave
    if (/[A-Za-z_@#]/.test(c)) {
      let j = i + 1
      while (j < n && /[A-Za-z0-9_@#$]/.test(src[j])) j++
      const text = src.slice(i, j)
      toks.push({ t: 'id', v: text, up: text.toUpperCase(), line })
      i = j
      continue
    }
    const two = src.slice(i, i + 2)
    if (OPS3.includes(two)) {
      toks.push({ t: 'op', v: two, up: two, line })
      i += 2
      continue
    }
    if ('(),;.=<>+-*/%'.includes(c)) {
      toks.push({ t: 'op', v: c, up: c, line })
      i++
      continue
    }
    throw new SqlError(102, `Incorrect syntax near '${c}'.`, 15, 1, true, [], line)
  }
  toks.push({ t: 'eof', v: '', up: '', line })
  return toks
}

/** Divide un script en lotes por las lineas "GO". */
export function splitBatches(script: string): { text: string; line: number }[] {
  const out: { text: string; line: number }[] = []
  const lines = script.replace(/\r\n/g, '\n').split('\n')
  let buf: string[] = []
  let start = 1
  const flush = (nextStart: number) => {
    if (buf.some((l) => l.trim())) out.push({ text: buf.join('\n'), line: start })
    buf = []
    start = nextStart
  }
  lines.forEach((l, i) => {
    if (/^\s*GO\s*\d*\s*;?\s*(--.*)?$/i.test(l)) flush(i + 2)
    else buf.push(l)
  })
  flush(lines.length + 1)
  return out
}

// ---------------------------------------------------------------- parser

const RESERVED = new Set(
  (
    'ADD ALL ALTER AND ANY AS ASC AUTHORIZATION BACKUP BEGIN BETWEEN BREAK BROWSE BULK BY CASCADE CASE CHECK CHECKPOINT CLOSE CLUSTERED COALESCE COLLATE COLUMN COMMIT COMPUTE CONSTRAINT CONTAINS CONTINUE CONVERT CREATE CROSS CURRENT CURSOR DATABASE DBCC DEALLOCATE DECLARE DEFAULT DELETE DENY DESC DISK DISTINCT DISTRIBUTED DOUBLE DROP DUMP ELSE END ERRLVL ESCAPE EXCEPT EXEC EXECUTE EXISTS EXIT EXTERNAL FETCH FILE FILLFACTOR FOR FOREIGN FREETEXT FROM FULL FUNCTION GOTO GRANT GROUP HAVING HOLDLOCK IDENTITY IDENTITY_INSERT IDENTITYCOL IF IN INDEX INNER INSERT INTERSECT INTO IS JOIN KEY KILL LEFT LIKE LINENO LOAD MERGE NATIONAL NOCHECK NONCLUSTERED NOT NULL NULLIF OF OFF OFFSETS ON OPEN OPENDATASOURCE OPENQUERY OPENROWSET OPENXML OPTION OR ORDER OUTER OVER PERCENT PIVOT PLAN PRECISION PRIMARY PRINT PROC PROCEDURE PUBLIC RAISERROR READ READTEXT RECONFIGURE REFERENCES REPLICATION RESTORE RESTRICT RETURN REVERT REVOKE RIGHT ROLLBACK ROWCOUNT ROWGUIDCOL RULE SAVE SCHEMA SECURITYAUDIT SELECT SEMANTICKEYPHRASETABLE SESSION_USER SET SETUSER SHUTDOWN SOME STATISTICS SYSTEM_USER TABLE TABLESAMPLE TEXTSIZE THEN TO TOP TRAN TRANSACTION TRIGGER TRUNCATE TRY_CONVERT TSEQUAL UNION UNIQUE UNPIVOT UPDATE UPDATETEXT USE USER VALUES VARYING VIEW WAITFOR WHEN WHERE WHILE WITH WITHIN WRITETEXT'
  ).split(' '),
)

const STMT_START = new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'EXEC', 'EXECUTE', 'USE', 'GRANT', 'REVOKE', 'DENY', 'PRINT', 'SET', 'DECLARE', 'BEGIN', 'COMMIT', 'ROLLBACK'])
const AGGS = new Set(['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'])

export const isAggregate = (name: string) => AGGS.has(name.toUpperCase())

const unsupported = (what: string, line: number) =>
  new SqlError(
    0,
    `El simulador de stray todavía no soporta ${what}. Pruébalo directamente en SSMS (en esta etapa del curso no se necesita).`,
    16,
    1,
    true,
    [],
    line,
  )

class Parser {
  i = 0
  constructor(private toks: Tok[]) {}

  peek(o = 0) {
    return this.toks[Math.min(this.i + o, this.toks.length - 1)]
  }
  next() {
    return this.toks[this.i++]
  }
  isKw(w: string, o = 0) {
    const t = this.peek(o)
    return t.t === 'id' && t.up === w
  }
  eatKw(w: string) {
    if (this.isKw(w)) {
      this.i++
      return true
    }
    return false
  }
  expectKw(w: string) {
    if (!this.eatKw(w)) this.fail()
  }
  isOp(o: string, k = 0) {
    const t = this.peek(k)
    return t.t === 'op' && t.v === o
  }
  eatOp(o: string) {
    if (this.isOp(o)) {
      this.i++
      return true
    }
    return false
  }
  expectOp(o: string) {
    if (!this.eatOp(o)) this.fail()
  }

  fail(tok?: Tok): never {
    let t = tok ?? this.peek()
    if (t.t === 'eof') t = this.toks[Math.max(0, this.toks.length - 2)] ?? t
    const near = t.t === 'str' ? `'${t.v}'` : t.v
    if (t.t === 'id' && RESERVED.has(t.up)) throw new SqlError(156, `Incorrect syntax near the keyword '${t.v}'.`, 15, 1, true, [], t.line)
    throw new SqlError(102, `Incorrect syntax near '${near}'.`, 15, 1, true, [], t.line)
  }

  /** identificador (no reservado, o entre corchetes) */
  ident(): string {
    const t = this.peek()
    if (t.t === 'bid' || (t.t === 'id' && !RESERVED.has(t.up))) {
      this.i++
      return t.v
    }
    return this.fail()
  }
  /** identificador que puede ser palabra reservada solo si va entre corchetes; permite cualquier id (para alias de columnas) */
  identAny(): string {
    const t = this.peek()
    if (t.t === 'bid' || t.t === 'id') {
      this.i++
      return t.v
    }
    return this.fail()
  }

  tableName(): TableName {
    const parts: string[] = []
    const first = this.peek()
    parts.push(this.ident())
    while (this.isOp('.')) {
      this.i++
      // db..tabla no se soporta
      parts.push(this.ident())
    }
    const last = parts.length
    const text = parts.join('.')
    void first
    if (last === 1) return { name: parts[0], text }
    if (last === 2) return { schema: parts[0], name: parts[1], text }
    if (last === 3) return { db: parts[0], schema: parts[1], name: parts[2], text }
    return this.fail()
  }

  // ------------------------------------------------------------ lote
  batch(): Stmt[] {
    const out: Stmt[] = []
    while (this.peek().t !== 'eof') {
      if (this.eatOp(';')) continue
      out.push(this.statement())
      this.eatOp(';')
    }
    return out
  }

  statement(): Stmt {
    const t = this.peek()
    if (t.t !== 'id') return this.fail()
    switch (t.up) {
      case 'SELECT':
        return this.select()
      case 'INSERT':
        return this.insert()
      case 'UPDATE':
        return this.update()
      case 'DELETE':
        return this.delete()
      case 'CREATE':
        return this.create()
      case 'ALTER':
        return this.alter()
      case 'DROP':
        return this.drop()
      case 'TRUNCATE':
        return this.truncate()
      case 'EXEC':
      case 'EXECUTE':
        return this.exec()
      case 'USE': {
        this.i++
        const name = this.identAny()
        return { k: 'use', line: t.line, name }
      }
      case 'PRINT': {
        this.i++
        return { k: 'print', line: t.line, text: this.expr() }
      }
      case 'SET':
        return this.set()
      case 'GRANT':
      case 'REVOKE':
      case 'DENY':
        return this.skipStatement(t.up)
      case 'DECLARE':
        throw unsupported('variables (DECLARE)', t.line)
      case 'BEGIN':
      case 'COMMIT':
      case 'ROLLBACK':
        throw unsupported('transacciones', t.line)
      default:
        return this.fail()
    }
  }

  /** GRANT / REVOKE / DENY / CREATE USER...: se aceptan sin hacer nada (el simulador no tiene usuarios reales). */
  skipStatement(what: string): Stmt {
    const line = this.peek().line
    this.i++
    while (this.peek().t !== 'eof' && !this.isOp(';')) {
      const t = this.peek()
      if (t.t === 'id' && STMT_START.has(t.up)) {
        // "GRANT SELECT, INSERT ON t TO u": SELECT/INSERT/UPDATE/DELETE forman parte del permiso
        const prev = this.toks[this.i - 1]
        const permLike = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(t.up) && (prev.v === ',' || ['GRANT', 'REVOKE', 'DENY'].includes(prev.up))
        if (!permLike) break
      }
      this.i++
    }
    return { k: 'noop', line, what }
  }

  set(): Stmt {
    const line = this.next().line
    if (this.isKw('IDENTITY_INSERT')) {
      this.i++
      const table = this.tableName()
      const onoff = this.next()
      if (onoff.up !== 'ON' && onoff.up !== 'OFF') return this.fail(onoff)
      return { k: 'identityInsert', line, table, on: onoff.up === 'ON' }
    }
    // SET NOCOUNT ON, SET ANSI_NULLS ON...
    this.identAny()
    if (this.isKw('ON') || this.isKw('OFF')) this.i++
    else this.fail()
    return { k: 'noop', line, what: 'SET' }
  }

  // ------------------------------------------------------------ SELECT
  select(): SelectStmt {
    const line = this.next().line
    const st: SelectStmt = { k: 'select', line, distinct: false, items: [] }
    if (this.eatKw('DISTINCT')) st.distinct = true
    else this.eatKw('ALL')
    if (this.eatKw('TOP')) {
      if (this.eatOp('(')) {
        st.top = this.expr()
        this.expectOp(')')
      } else {
        const t = this.next()
        if (t.t !== 'num') return this.fail(t)
        st.top = this.numLit(t)
      }
      if (this.isKw('PERCENT')) throw unsupported('TOP ... PERCENT', line)
      if (this.isKw('WITH')) throw unsupported('TOP ... WITH TIES', line)
    }
    // lista de columnas
    for (;;) {
      st.items.push(this.selectItem())
      if (!this.eatOp(',')) break
    }
    if (this.eatKw('FROM')) {
      if (this.isOp('(')) throw unsupported('subconsultas en FROM', line)
      const table = this.tableName()
      let alias: string | undefined
      if (this.eatKw('AS')) alias = this.identAny()
      else if (this.peek().t === 'bid' || (this.peek().t === 'id' && !RESERVED.has(this.peek().up) && !this.isKw('GO'))) alias = this.ident()
      st.from = { table, alias }
      if (this.isOp(',')) throw unsupported('varias tablas en FROM (las uniones llegan después)', line)
      const u = this.peek()
      if (u.t === 'id' && ['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'OUTER'].includes(u.up)) throw unsupported('JOIN (todavía no se ve en el curso)', line)
    }
    if (this.eatKw('WHERE')) st.where = this.expr()
    if (this.eatKw('GROUP')) {
      this.expectKw('BY')
      st.groupBy = []
      for (;;) {
        st.groupBy.push(this.expr())
        if (!this.eatOp(',')) break
      }
    }
    if (this.eatKw('HAVING')) st.having = this.expr()
    if (this.eatKw('ORDER')) {
      this.expectKw('BY')
      st.orderBy = []
      for (;;) {
        const e = this.expr()
        let desc = false
        if (this.eatKw('DESC')) desc = true
        else this.eatKw('ASC')
        st.orderBy.push({ e, desc })
        if (!this.eatOp(',')) break
      }
      if (this.eatKw('OFFSET')) {
        st.offset = this.expr()
        if (!this.eatKw('ROWS') && !this.eatKw('ROW')) this.fail()
        if (this.eatKw('FETCH')) {
          if (!this.eatKw('NEXT') && !this.eatKw('FIRST')) this.fail()
          st.fetch = this.expr()
          if (!this.eatKw('ROWS') && !this.eatKw('ROW')) this.fail()
          this.expectKw('ONLY')
        }
      }
    }
    if (this.isKw('UNION') || this.isKw('EXCEPT') || this.isKw('INTERSECT')) throw unsupported('UNION / EXCEPT / INTERSECT', line)
    return st
  }

  selectItem(): SelectItem {
    if (this.isOp('*')) {
      this.i++
      return { star: true }
    }
    if ((this.peek().t === 'id' || this.peek().t === 'bid') && this.isOp('.', 1) && this.isOp('*', 2)) {
      const t = this.next()
      this.i += 2
      return { star: true, starOf: t.v }
    }
    const expr = this.expr()
    let alias: string | undefined
    if (this.eatKw('AS')) alias = this.identAny()
    else {
      const t = this.peek()
      if (t.t === 'bid' || (t.t === 'id' && !RESERVED.has(t.up))) alias = this.ident()
      else if (t.t === 'str') {
        this.i++
        alias = t.v
      }
    }
    return { expr, alias }
  }

  numLit(t: Tok): Expr {
    return { k: 'lit', v: numValue(t.v) }
  }

  // ------------------------------------------------------------ expresiones
  expr(): Expr {
    return this.or()
  }
  or(): Expr {
    let l = this.and()
    while (this.eatKw('OR')) l = { k: 'bin', op: 'OR', l, r: this.and() }
    return l
  }
  and(): Expr {
    let l = this.not()
    while (this.eatKw('AND')) l = { k: 'bin', op: 'AND', l, r: this.not() }
    return l
  }
  not(): Expr {
    if (this.eatKw('NOT')) return { k: 'un', op: 'NOT', e: this.not() }
    return this.pred()
  }
  pred(): Expr {
    const l = this.add()
    const t = this.peek()
    if (t.t === 'op' && ['=', '<>', '!=', '<', '>', '<=', '>='].includes(t.v)) {
      this.i++
      const op = (t.v === '!=' ? '<>' : t.v) as '=' | '<>' | '<' | '>' | '<=' | '>='
      return { k: 'bin', op, l, r: this.add() }
    }
    if (this.isKw('IS')) {
      this.i++
      const neg = this.eatKw('NOT')
      this.expectKw('NULL')
      return { k: 'isnull', e: l, neg }
    }
    let neg = false
    if (this.isKw('NOT') && (this.isKw('IN', 1) || this.isKw('BETWEEN', 1) || this.isKw('LIKE', 1))) {
      this.i++
      neg = true
    }
    if (this.eatKw('IN')) {
      this.expectOp('(')
      if (this.isKw('SELECT')) throw unsupported('subconsultas dentro de IN', t.line)
      const list: Expr[] = []
      for (;;) {
        list.push(this.expr())
        if (!this.eatOp(',')) break
      }
      this.expectOp(')')
      return { k: 'in', e: l, list, neg }
    }
    if (this.eatKw('BETWEEN')) {
      const lo = this.add()
      this.expectKw('AND')
      const hi = this.add()
      return { k: 'between', e: l, lo, hi, neg }
    }
    if (this.eatKw('LIKE')) {
      return { k: 'like', e: l, pat: this.add(), neg }
    }
    return l
  }
  add(): Expr {
    let l = this.mul()
    for (;;) {
      if (this.isOp('+') || this.isOp('-')) {
        const op = this.next().v as '+' | '-'
        l = { k: 'bin', op, l, r: this.mul() }
      } else return l
    }
  }
  mul(): Expr {
    let l = this.unary()
    for (;;) {
      if (this.isOp('*') || this.isOp('/') || this.isOp('%')) {
        const op = this.next().v as '*' | '/' | '%'
        l = { k: 'bin', op, l, r: this.unary() }
      } else return l
    }
  }
  unary(): Expr {
    if (this.isOp('-') || this.isOp('+')) {
      const op = this.next().v as '-' | '+'
      return { k: 'un', op, e: this.unary() }
    }
    return this.primary()
  }
  primary(): Expr {
    const t = this.peek()
    if (t.t === 'num') {
      this.i++
      return this.numLit(t)
    }
    if (t.t === 'str') {
      this.i++
      const len = Math.max(1, t.v.length)
      return { k: 'lit', v: { t: { k: 'str', n: t.n ? 'nvarchar' : 'varchar', len }, v: t.v } }
    }
    if (this.isOp('(')) {
      this.i++
      if (this.isKw('SELECT')) throw unsupported('subconsultas', t.line)
      const e = this.expr()
      this.expectOp(')')
      return e
    }
    if (t.t === 'id' && t.up === 'NULL') {
      this.i++
      return { k: 'lit', v: { t: { k: 'null' }, v: null } }
    }
    if (t.t === 'id' && t.up === 'CASE') throw unsupported('CASE', t.line)
    if (t.t === 'id' && t.v.startsWith('@')) throw unsupported('variables (@nombre)', t.line)
    if (t.t === 'id' && t.up === 'CAST' && this.isOp('(', 1)) {
      this.i += 2
      const e = this.expr()
      this.expectKw('AS')
      const ty = this.type()
      this.expectOp(')')
      return { k: 'cast', e, ty }
    }
    if (t.t === 'id' && t.up === 'CONVERT' && this.isOp('(', 1)) {
      this.i += 2
      const ty = this.type()
      this.expectOp(',')
      const e = this.expr()
      this.expectOp(')')
      return { k: 'cast', e, ty }
    }
    // llamada a funcion
    if ((t.t === 'id' || t.t === 'bid') && this.isOp('(', 1) && !(t.t === 'id' && RESERVED.has(t.up) && !['LEFT', 'RIGHT', 'COALESCE', 'NULLIF'].includes(t.up))) {
      this.i += 2
      const name = t.up
      const args: Expr[] = []
      let distinct = false
      let star = false
      if (this.isOp('*')) {
        this.i++
        star = true
      } else if (!this.isOp(')')) {
        if (this.eatKw('DISTINCT')) distinct = true
        for (;;) {
          args.push(this.expr())
          if (!this.eatOp(',')) break
        }
      }
      this.expectOp(')')
      return { k: 'fn', name, args, distinct, star }
    }
    // columna
    if (t.t === 'bid' || (t.t === 'id' && !RESERVED.has(t.up))) {
      const parts = [this.ident()]
      while (this.isOp('.') && (this.peek(1).t === 'id' || this.peek(1).t === 'bid')) {
        this.i++
        parts.push(this.identAny())
      }
      if (parts.length === 1) return { k: 'col', name: parts[0] }
      return { k: 'col', table: parts[parts.length - 2], name: parts[parts.length - 1] }
    }
    return this.fail()
  }

  // ------------------------------------------------------------ tipos de dato
  type(): Ty {
    const t = this.next()
    if (t.t !== 'id' && t.t !== 'bid') return this.fail(t)
    const name = t.up.toLowerCase()
    let a: number | 'max' | undefined
    let b: number | undefined
    if (this.eatOp('(')) {
      const x = this.next()
      if (x.t === 'id' && x.up === 'MAX') a = 'max'
      else if (x.t === 'num') a = Number(x.v)
      else return this.fail(x)
      if (this.eatOp(',')) {
        const y = this.next()
        if (y.t !== 'num') return this.fail(y)
        b = Number(y.v)
      }
      this.expectOp(')')
    }
    const len = (def: number) => (a === 'max' ? Infinity : typeof a === 'number' ? a : def)
    switch (name) {
      case 'int':
      case 'integer':
        return { k: 'int', n: 'int' }
      case 'bigint':
        return { k: 'int', n: 'bigint' }
      case 'smallint':
        return { k: 'int', n: 'smallint' }
      case 'tinyint':
        return { k: 'int', n: 'tinyint' }
      case 'bit':
        return { k: 'bit' }
      case 'decimal':
        return { k: 'dec', p: typeof a === 'number' ? a : 18, s: b ?? 0 }
      case 'numeric':
        return { k: 'dec', p: typeof a === 'number' ? a : 18, s: b ?? 0, kw: 'numeric' }
      case 'float':
      case 'real':
        return { k: 'float' }
      case 'char':
        return { k: 'str', n: 'char', len: len(1) }
      case 'varchar':
        return { k: 'str', n: 'varchar', len: len(1) }
      case 'nchar':
        return { k: 'str', n: 'nchar', len: len(1) }
      case 'nvarchar':
        return { k: 'str', n: 'nvarchar', len: len(1) }
      case 'date':
        return { k: 'date' }
      case 'datetime':
      case 'datetime2':
      case 'smalldatetime':
        return { k: 'datetime' }
      default:
        throw new SqlError(2715, `Column, parameter, or variable #1: Cannot find data type ${t.v}.`, 16, 7, true, [], t.line)
    }
  }

  // ------------------------------------------------------------ DDL
  create(): Stmt {
    const line = this.next().line
    const t = this.peek()
    if (this.eatKw('DATABASE')) return { k: 'createDb', line, name: this.identAny() }
    if (this.eatKw('TABLE')) {
      const table = this.tableName()
      this.expectOp('(')
      const { cols, constraints } = this.tableBody()
      this.expectOp(')')
      return { k: 'createTable', line, table, cols, constraints }
    }
    if (t.t === 'id' && ['LOGIN', 'USER', 'ROLE', 'SCHEMA'].includes(t.up)) {
      this.i--
      return this.skipStatement('CREATE ' + t.up)
    }
    if (t.t === 'id' && ['INDEX', 'UNIQUE', 'CLUSTERED', 'NONCLUSTERED', 'VIEW', 'PROCEDURE', 'PROC', 'FUNCTION', 'TRIGGER', 'SEQUENCE'].includes(t.up)) {
      throw unsupported(`CREATE ${t.up} (se ve más adelante en el curso)`, line)
    }
    return this.fail()
  }

  tableBody(): { cols: ColDef[]; constraints: TableConstraint[] } {
    const cols: ColDef[] = []
    const constraints: TableConstraint[] = []
    for (;;) {
      if (this.isKw('CONSTRAINT') || this.isKw('PRIMARY') || this.isKw('FOREIGN') || this.isKw('UNIQUE') || this.isKw('CHECK')) {
        constraints.push(this.tableConstraint())
      } else {
        cols.push(this.colDef())
      }
      if (!this.eatOp(',')) break
    }
    return { cols, constraints }
  }

  colList(): string[] {
    this.expectOp('(')
    const cols: string[] = []
    for (;;) {
      cols.push(this.ident())
      if (this.isKw('ASC') || this.isKw('DESC')) this.i++
      if (!this.eatOp(',')) break
    }
    this.expectOp(')')
    return cols
  }

  tableConstraint(): TableConstraint {
    let name: string | undefined
    if (this.eatKw('CONSTRAINT')) name = this.ident()
    if (this.eatKw('PRIMARY')) {
      this.expectKw('KEY')
      if (this.isKw('CLUSTERED') || this.isKw('NONCLUSTERED')) this.i++
      return { k: 'pk', name, cols: this.colList() }
    }
    if (this.eatKw('UNIQUE')) {
      if (this.isKw('CLUSTERED') || this.isKw('NONCLUSTERED')) this.i++
      return { k: 'unique', name, cols: this.colList() }
    }
    if (this.eatKw('FOREIGN')) {
      this.expectKw('KEY')
      const cols = this.colList()
      this.expectKw('REFERENCES')
      const ref = this.tableName()
      const refCols = this.isOp('(') ? this.colList() : undefined
      this.refActions()
      return { k: 'fk', name, cols, ref, refCols }
    }
    if (this.eatKw('CHECK')) {
      this.expectOp('(')
      const expr = this.expr()
      this.expectOp(')')
      return { k: 'check', name, expr }
    }
    if (this.eatKw('DEFAULT')) {
      const expr = this.unary()
      this.expectKw('FOR')
      return { k: 'default', name, expr, col: this.ident() }
    }
    return this.fail()
  }

  refActions() {
    if (this.isKw('ON')) throw unsupported('ON DELETE / ON UPDATE (acciones en cascada)', this.peek().line)
  }

  colDef(): ColDef {
    const name = this.ident()
    const ty = this.type()
    const col: ColDef = { name, ty }
    for (;;) {
      let cname: string | undefined
      if (this.isKw('CONSTRAINT')) {
        this.i++
        cname = this.ident()
      }
      if (this.eatKw('NOT')) {
        this.expectKw('NULL')
        col.nullable = false
      } else if (this.eatKw('NULL')) {
        col.nullable = true
      } else if (this.eatKw('IDENTITY')) {
        let seed = 1
        let inc = 1
        if (this.eatOp('(')) {
          seed = Number(this.next().v)
          this.expectOp(',')
          inc = Number(this.next().v)
          this.expectOp(')')
        }
        col.identity = { seed, inc }
      } else if (this.eatKw('PRIMARY')) {
        this.expectKw('KEY')
        if (this.isKw('CLUSTERED') || this.isKw('NONCLUSTERED')) this.i++
        col.pk = { name: cname }
      } else if (this.eatKw('UNIQUE')) {
        if (this.isKw('CLUSTERED') || this.isKw('NONCLUSTERED')) this.i++
        col.unique = { name: cname }
      } else if (this.eatKw('DEFAULT')) {
        col.def = { name: cname, expr: this.unary() }
      } else if (this.eatKw('REFERENCES')) {
        const table = this.tableName()
        const refCol = this.isOp('(') ? this.colList()[0] : undefined
        this.refActions()
        col.ref = { name: cname, table, col: refCol }
      } else if (this.eatKw('CHECK')) {
        this.expectOp('(')
        const expr = this.expr()
        this.expectOp(')')
        col.check = { name: cname, expr }
      } else if (this.eatKw('COLLATE')) {
        this.identAny()
      } else {
        if (cname) this.fail()
        break
      }
    }
    return col
  }

  alter(): Stmt {
    const line = this.next().line
    if (!this.eatKw('TABLE')) {
      if (this.isKw('DATABASE')) throw unsupported('ALTER DATABASE', line)
      return this.fail()
    }
    const table = this.tableName()
    if (this.eatKw('ADD')) {
      const cols: ColDef[] = []
      const constraints: TableConstraint[] = []
      for (;;) {
        if (this.isKw('CONSTRAINT') || this.isKw('PRIMARY') || this.isKw('FOREIGN') || this.isKw('UNIQUE') || this.isKw('CHECK')) constraints.push(this.tableConstraint())
        else if (this.isKw('DEFAULT')) constraints.push(this.tableConstraint())
        else cols.push(this.colDef())
        if (!this.eatOp(',')) break
      }
      return { k: 'alterAdd', line, table, cols, constraints }
    }
    if (this.eatKw('DROP')) {
      if (this.eatKw('COLUMN')) {
        const cols: string[] = []
        for (;;) {
          cols.push(this.ident())
          if (!this.eatOp(',')) break
        }
        return { k: 'alterDropCol', line, table, cols }
      }
      if (this.eatKw('CONSTRAINT')) return { k: 'alterDropConstraint', line, table, name: this.ident() }
      return this.fail()
    }
    if (this.eatKw('ALTER')) {
      this.expectKw('COLUMN')
      const col = this.ident()
      const ty = this.type()
      let nullable: boolean | undefined
      if (this.eatKw('NOT')) {
        this.expectKw('NULL')
        nullable = false
      } else if (this.eatKw('NULL')) nullable = true
      return { k: 'alterCol', line, table, col, ty, nullable }
    }
    return this.fail()
  }

  drop(): Stmt {
    const line = this.next().line
    if (this.eatKw('TABLE')) {
      let ifExists = false
      if (this.eatKw('IF')) {
        this.expectKw('EXISTS')
        ifExists = true
      }
      const tables: TableName[] = []
      for (;;) {
        tables.push(this.tableName())
        if (!this.eatOp(',')) break
      }
      return { k: 'dropTable', line, tables, ifExists }
    }
    if (this.eatKw('DATABASE')) {
      let ifExists = false
      if (this.eatKw('IF')) {
        this.expectKw('EXISTS')
        ifExists = true
      }
      return { k: 'dropDb', line, name: this.identAny(), ifExists }
    }
    const t = this.peek()
    if (t.t === 'id' && ['INDEX', 'VIEW', 'PROCEDURE', 'PROC', 'FUNCTION', 'TRIGGER', 'USER', 'LOGIN', 'ROLE', 'SCHEMA'].includes(t.up)) {
      if (['USER', 'LOGIN', 'ROLE'].includes(t.up)) {
        this.i--
        return this.skipStatement('DROP ' + t.up)
      }
      throw unsupported(`DROP ${t.up}`, line)
    }
    return this.fail()
  }

  truncate(): Stmt {
    const line = this.next().line
    this.expectKw('TABLE')
    return { k: 'truncate', line, table: this.tableName() }
  }

  exec(): Stmt {
    const line = this.next().line
    const t = this.next()
    if (t.t !== 'id' || t.up !== 'SP_RENAME') {
      if (t.t === 'id' || t.t === 'bid') throw unsupported(`EXEC ${t.v}`, line)
      return this.fail(t)
    }
    const args: string[] = []
    for (;;) {
      const a = this.peek()
      if (a.t === 'id' && a.v.startsWith('@') && this.isOp('=', 1)) this.i += 2
      const v = this.next()
      if (v.t !== 'str') return this.fail(v)
      args.push(v.v)
      if (!this.eatOp(',')) break
    }
    if (args.length < 2) return this.fail()
    return { k: 'rename', line, obj: args[0], to: args[1], kind: args[2] }
  }

  // ------------------------------------------------------------ DML
  insert(): Stmt {
    const line = this.next().line
    this.eatKw('INTO')
    const table = this.tableName()
    let cols: string[] | undefined
    if (this.isOp('(')) cols = this.colList()
    if (this.isKw('SELECT')) throw unsupported('INSERT ... SELECT', line)
    if (this.isKw('DEFAULT')) throw unsupported('DEFAULT VALUES', line)
    this.expectKw('VALUES')
    const rows: (Expr | 'default')[][] = []
    for (;;) {
      this.expectOp('(')
      const row: (Expr | 'default')[] = []
      for (;;) {
        if (this.isKw('DEFAULT')) {
          this.i++
          row.push('default')
        } else row.push(this.expr())
        if (!this.eatOp(',')) break
      }
      this.expectOp(')')
      rows.push(row)
      if (!this.eatOp(',')) break
    }
    return { k: 'insert', line, table, cols, rows }
  }

  update(): Stmt {
    const line = this.next().line
    const table = this.tableName()
    this.expectKw('SET')
    const sets: { col: string; expr: Expr }[] = []
    for (;;) {
      const col = this.ident()
      this.expectOp('=')
      sets.push({ col, expr: this.expr() })
      if (!this.eatOp(',')) break
    }
    if (this.isKw('FROM')) throw unsupported('UPDATE ... FROM', line)
    const where = this.eatKw('WHERE') ? this.expr() : undefined
    return { k: 'update', line, table, sets, where }
  }

  delete(): Stmt {
    const line = this.next().line
    this.eatKw('FROM')
    const table = this.tableName()
    const where = this.eatKw('WHERE') ? this.expr() : undefined
    return { k: 'delete', line, table, where }
  }
}

/** Literal numerico con el tipo que le asigna SQL Server. */
export function numValue(text: string): { t: Ty; v: number } {
  if (/[eE]/.test(text)) return { t: { k: 'float' }, v: Number(text) }
  if (text.includes('.')) {
    const [ip, fp = ''] = text.split('.')
    const s = fp.length
    const intDigits = ip.replace(/^0+/, '').length
    const p = Math.max(1, intDigits + s)
    return { t: { k: 'dec', p, s }, v: Number(text) }
  }
  const v = Number(text)
  if (v > 2147483647) return { t: { k: 'int', n: 'bigint' }, v }
  return { t: { k: 'int', n: 'int' }, v }
}

export function parseBatch(text: string): Stmt[] {
  return new Parser(lex(text)).batch()
}
