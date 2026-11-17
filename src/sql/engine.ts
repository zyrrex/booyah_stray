// Motor del simulador T-SQL: catalogo, restricciones, DDL, DML y consultas SELECT (sin JOIN).
// Reproduce el comportamiento y los MENSAJES DE ERROR de SQL Server para el subconjunto que se ensena.

import { isAggregate, parseBatch, splitBatches } from './parser'
import {
  SqlError,
  type Cell,
  type ColDef,
  type Expr,
  type ResultSet,
  type SelectStmt,
  type SqlEvent,
  type Stmt,
  type TableConstraint,
  type TableName,
  type Ty,
  type V,
} from './types'
import {
  BOOLT,
  INT,
  NULLV,
  arith,
  boolV,
  cmpStr,
  coerce,
  compare,
  decPS,
  eqKey,
  fmtV,
  higherType,
  intV,
  likeRegex,
  nowDatetime,
  parseDate,
  roundTo,
  typeFull,
  typeName,
} from './values'

// ---------------------------------------------------------------- catalogo

interface Column {
  name: string
  ty: Ty
  nullable: boolean
  identity?: { seed: number; inc: number }
  def?: { name: string; expr: Expr }
}
interface KeyDef {
  name: string
  cols: number[]
}
interface FkDef {
  name: string
  cols: number[]
  refTable: string
  refCols: number[]
}
interface CheckDef {
  name: string
  expr: Expr
  col?: string
}
interface Table {
  name: string
  cols: Column[]
  rows: Cell[][]
  pk?: KeyDef
  uniques: KeyDef[]
  fks: FkDef[]
  checks: CheckDef[]
  identNext: number | null
  identityInsert: boolean
}
interface Db {
  name: string
  tables: Map<string, Table>
}

interface ColInfo {
  name: string
  ty: Ty
  /** alias o nombre de tabla en minusculas (para resolver) */
  table: string
  /** como se escribio (para los mensajes) */
  tdisp: string
}
type Phase = 'select' | 'where' | 'having' | 'order' | 'values'
interface Env {
  cols: ColInfo[]
  row: Cell[] | null
  group?: Cell[][]
  groupKeys?: Expr[]
  phase: Phase
}

const lc = (s: string) => s.toLowerCase()
const TERMINATED = 'The statement has been terminated.'

function hash8(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0')
}

function exprKey(e: Expr): string {
  return JSON.stringify(e, (k, v) => ((k === 'name' || k === 'table') && typeof v === 'string' ? lc(v) : v))
}

export function hasAgg(e: Expr): boolean {
  switch (e.k) {
    case 'fn':
      return isAggregate(e.name) || e.args.some(hasAgg)
    case 'bin':
      return hasAgg(e.l) || hasAgg(e.r)
    case 'un':
    case 'isnull':
    case 'cast':
      return hasAgg(e.e)
    case 'in':
      return hasAgg(e.e) || e.list.some(hasAgg)
    case 'between':
      return hasAgg(e.e) || hasAgg(e.lo) || hasAgg(e.hi)
    case 'like':
      return hasAgg(e.e) || hasAgg(e.pat)
    default:
      return false
  }
}

function truth(v: V): boolean | null {
  if (v.t.k === 'bool') return v.v === null ? null : v.v === 1
  throw new SqlError(4145, 'An expression of non-boolean type specified in a context where a condition is expected.', 15, 1, true)
}

const toStr = (v: V): string => (typeof v.v === 'string' ? v.v : fmtV(v))
const strRes = (s: string | null, n: 'varchar' | 'nvarchar' = 'varchar'): V => ({ t: { k: 'str', n, len: Math.max(1, (s ?? '').length) }, v: s })

// ---------------------------------------------------------------- servidor

export class Server {
  dbs = new Map<string, Db>()
  cur: Db
  events: SqlEvent[] = []
  private warnNull = false
  /** limite de trabajo para que ninguna consulta bloquee el navegador */
  private budget = 2_000_000

  constructor() {
    this.cur = this.mkDb('Practica')
  }

  private mkDb(name: string): Db {
    const db: Db = { name, tables: new Map() }
    this.dbs.set(lc(name), db)
    return db
  }

  // ------------------------------------------------------------ lotes
  exec(script: string) {
    for (const b of splitBatches(script)) {
      let stmts: Stmt[]
      try {
        stmts = parseBatch(b.text)
      } catch (e) {
        if (e instanceof SqlError) {
          this.fail(e, b.line + (e.line ? e.line - 1 : 0))
          continue
        }
        throw e
      }
      const before = this.events.length
      let stopped = false
      for (const st of stmts) {
        const line = b.line + st.line - 1
        try {
          this.run(st)
        } catch (e) {
          if (!(e instanceof SqlError)) throw e
          const dml = st.k === 'insert' || st.k === 'update' || st.k === 'delete'
          if (dml && !e.stops && e.level >= 14 && !e.extra.includes(TERMINATED)) e.extra = [...e.extra, TERMINATED]
          this.fail(e, line)
          if (e.stops) {
            stopped = true
            break
          }
        }
      }
      void stopped
      if (this.events.length === before) this.events.push({ k: 'msg', text: 'Commands completed successfully.' })
    }
  }

  private fail(e: SqlError, line: number) {
    this.events.push({ k: 'error', num: e.num, level: e.level, state: e.state, line, text: e.message })
    for (const x of e.extra) this.events.push({ k: 'msg', text: x })
  }

  private msg(text: string) {
    this.events.push({ k: 'msg', text })
  }

  private affected(n: number) {
    this.msg(`(${n} row${n === 1 ? '' : 's'} affected)`)
  }

  private work(n = 1) {
    this.budget -= n
    if (this.budget < 0) throw new SqlError(0, 'La consulta es demasiado grande para el simulador.', 16, 1, true)
  }

  // ------------------------------------------------------------ resolucion de nombres
  private dbOf(tn: TableName): Db {
    if (!tn.db) return this.cur
    const db = this.dbs.get(lc(tn.db))
    if (!db) throw new SqlError(208, `Invalid object name '${tn.text}'.`, 16, 1, true)
    return db
  }

  private getTable(tn: TableName, notFound?: () => SqlError): Table {
    const db = this.dbOf(tn)
    const schema = tn.schema ? lc(tn.schema) : 'dbo'
    if (schema === 'information_schema') return this.infoSchema(db, tn.name)
    const t = schema === 'dbo' ? db.tables.get(lc(tn.name)) : undefined
    if (!t) throw notFound ? notFound() : new SqlError(208, `Invalid object name '${tn.text}'.`, 16, 1, true)
    return t
  }

  private disp(t: Table, db = this.cur) {
    return `${db.name}.dbo.${t.name}`
  }

  private colIndex(t: Table, name: string): number {
    const i = t.cols.findIndex((c) => lc(c.name) === lc(name))
    if (i < 0) throw new SqlError(207, `Invalid column name '${name}'.`, 16, 1, true)
    return i
  }

  // ------------------------------------------------------------ INFORMATION_SCHEMA
  private infoSchema(db: Db, which: string): Table {
    const mk = (names: string[], rows: Cell[][]): Table => ({
      name: which,
      cols: names.map((n) => ({ name: n, ty: { k: 'str', n: 'nvarchar', len: 128 } as Ty, nullable: true })),
      rows,
      uniques: [],
      fks: [],
      checks: [],
      identNext: null,
      identityInsert: false,
    })
    const tables = [...db.tables.values()]
    switch (lc(which)) {
      case 'tables':
        return mk(
          ['TABLE_CATALOG', 'TABLE_SCHEMA', 'TABLE_NAME', 'TABLE_TYPE'],
          tables.map((t) => [db.name, 'dbo', t.name, 'BASE TABLE']),
        )
      case 'columns': {
        const t = mk(['TABLE_CATALOG', 'TABLE_SCHEMA', 'TABLE_NAME', 'COLUMN_NAME', 'ORDINAL_POSITION', 'COLUMN_DEFAULT', 'IS_NULLABLE', 'DATA_TYPE', 'CHARACTER_MAXIMUM_LENGTH', 'NUMERIC_PRECISION', 'NUMERIC_SCALE'], [])
        t.cols[4].ty = INT
        t.cols[8].ty = INT
        t.cols[9].ty = { k: 'int', n: 'tinyint' }
        t.cols[10].ty = INT
        for (const tb of tables) {
          tb.cols.forEach((c, i) => {
            const num = c.ty.k === 'int' || c.ty.k === 'dec' || c.ty.k === 'bit'
            t.rows.push([
              db.name,
              'dbo',
              tb.name,
              c.name,
              i + 1,
              c.def ? `(${exprText(c.def.expr)})` : null,
              c.nullable ? 'YES' : 'NO',
              typeName(c.ty),
              c.ty.k === 'str' ? (c.ty.len === Infinity ? -1 : c.ty.len) : null,
              num ? decPS(c.ty).p : c.ty.k === 'float' ? 53 : null,
              num ? decPS(c.ty).s : null,
            ])
          })
        }
        return t
      }
      case 'table_constraints': {
        const rows: Cell[][] = []
        for (const tb of tables) {
          if (tb.pk) rows.push([db.name, 'dbo', tb.pk.name, 'dbo', tb.name, 'PRIMARY KEY'])
          for (const u of tb.uniques) rows.push([db.name, 'dbo', u.name, 'dbo', tb.name, 'UNIQUE'])
          for (const f of tb.fks) rows.push([db.name, 'dbo', f.name, 'dbo', tb.name, 'FOREIGN KEY'])
          for (const c of tb.checks) rows.push([db.name, 'dbo', c.name, 'dbo', tb.name, 'CHECK'])
        }
        return mk(['CONSTRAINT_CATALOG', 'CONSTRAINT_SCHEMA', 'CONSTRAINT_NAME', 'TABLE_SCHEMA', 'TABLE_NAME', 'CONSTRAINT_TYPE'], rows)
      }
      case 'key_column_usage': {
        const rows: Cell[][] = []
        for (const tb of tables) {
          const add = (name: string, cols: number[]) => cols.forEach((ci, k) => rows.push([db.name, 'dbo', name, db.name, 'dbo', tb.name, tb.cols[ci].name, k + 1]))
          if (tb.pk) add(tb.pk.name, tb.pk.cols)
          for (const u of tb.uniques) add(u.name, u.cols)
          for (const f of tb.fks) add(f.name, f.cols)
        }
        const t = mk(['CONSTRAINT_CATALOG', 'CONSTRAINT_SCHEMA', 'CONSTRAINT_NAME', 'TABLE_CATALOG', 'TABLE_SCHEMA', 'TABLE_NAME', 'COLUMN_NAME', 'ORDINAL_POSITION'], rows)
        t.cols[7].ty = INT
        return t
      }
      case 'referential_constraints': {
        const rows: Cell[][] = []
        for (const tb of tables) for (const f of tb.fks) {
          const parent = db.tables.get(f.refTable)
          rows.push([db.name, 'dbo', f.name, parent?.pk?.name ?? parent?.uniques[0]?.name ?? null, 'NO ACTION', 'NO ACTION'])
        }
        return mk(['CONSTRAINT_CATALOG', 'CONSTRAINT_SCHEMA', 'CONSTRAINT_NAME', 'UNIQUE_CONSTRAINT_NAME', 'UPDATE_RULE', 'DELETE_RULE'], rows)
      }
      default:
        throw new SqlError(208, `Invalid object name 'INFORMATION_SCHEMA.${which}'.`, 16, 1, true)
    }
  }

  // ------------------------------------------------------------ despacho
  private run(st: Stmt) {
    switch (st.k) {
      case 'select':
        return this.select(st)
      case 'createDb': {
        if (this.dbs.has(lc(st.name))) throw new SqlError(1801, `Database '${st.name}' already exists. Choose a different database name.`, 16, 3, true)
        this.mkDb(st.name)
        return
      }
      case 'dropDb': {
        const db = this.dbs.get(lc(st.name))
        if (!db) {
          if (st.ifExists) return
          throw new SqlError(3701, `Cannot drop the database '${st.name}', because it does not exist or you do not have permission.`, 11, 1, true)
        }
        if (db === this.cur) throw new SqlError(3702, `Cannot drop database "${st.name}" because it is currently in use.`, 16, 3, true)
        this.dbs.delete(lc(st.name))
        return
      }
      case 'use': {
        const db = this.dbs.get(lc(st.name))
        if (!db) throw new SqlError(911, `Database '${st.name}' does not exist. Make sure that the name is entered correctly.`, 16, 1, true)
        this.cur = db
        this.msg(`Changed database context to '${db.name}'.`)
        return
      }
      case 'createTable':
        return this.createTable(st)
      case 'alterAdd':
        return this.alterAdd(st)
      case 'alterDropCol':
        return this.alterDropCol(st)
      case 'alterDropConstraint':
        return this.alterDropConstraint(st)
      case 'alterCol':
        return this.alterCol(st)
      case 'dropTable':
        return this.dropTable(st)
      case 'truncate':
        return this.truncate(st)
      case 'insert':
        return this.insert(st)
      case 'update':
        return this.update(st)
      case 'delete':
        return this.del(st)
      case 'rename':
        return this.rename(st)
      case 'print': {
        const v = evalExpr(st.text, { cols: [], row: null, phase: 'values' }, this)
        this.msg(v.v === null ? '' : toStr(v))
        return
      }
      case 'identityInsert': {
        const t = this.getTable(st.table)
        if (!t.cols.some((c) => c.identity)) throw new SqlError(8106, `Table '${t.name}' does not have the identity property. Cannot perform SET operation.`, 16, 1, true)
        t.identityInsert = st.on
        return
      }
      case 'noop':
        return
    }
  }

  // ------------------------------------------------------------ CREATE TABLE
  private buildTable(name: string, cols: ColDef[], constraints: TableConstraint[], self: Table | null, addToExisting: boolean): Table {
    const t: Table = self ?? { name, cols: [], rows: [], uniques: [], fks: [], checks: [], identNext: null, identityInsert: false }
    const baseCount = t.cols.length
    const seen = new Set(t.cols.map((c) => lc(c.name)))
    for (const c of cols) {
      if (seen.has(lc(c.name))) {
        if (addToExisting) throw new SqlError(2705, `Column names in each table must be unique. Column name '${c.name}' in table '${name}' is specified more than once.`, 16, 1, true)
        throw new SqlError(2705, `Column names in each table must be unique. Column name '${c.name}' in table '${name}' is specified more than once.`, 16, 1, true)
      }
      seen.add(lc(c.name))
      t.cols.push({
        name: c.name,
        ty: c.ty,
        nullable: c.nullable ?? true,
        identity: c.identity,
        def: c.def ? { name: c.def.name ?? `DF__${name}__${c.name}__${hash8(name + c.name + 'df')}`, expr: c.def.expr } : undefined,
      })
    }
    const idx = (cn: string) => {
      const i = t.cols.findIndex((c) => lc(c.name) === lc(cn))
      if (i < 0) throw new SqlError(1911, `Column name '${cn}' does not exist in the target table or view.`, 16, 1, true)
      return i
    }
    // identity: no admite NULL
    for (let i = baseCount; i < t.cols.length; i++) {
      const c = t.cols[i]
      if (c.identity) {
        c.nullable = false
        if (t.identNext === null) t.identNext = c.identity.seed
      }
    }
    // restricciones de columna
    const all: TableConstraint[] = []
    cols.forEach((c) => {
      if (c.pk) all.push({ k: 'pk', name: c.pk.name, cols: [c.name] })
      if (c.unique) all.push({ k: 'unique', name: c.unique.name, cols: [c.name] })
      if (c.ref) all.push({ k: 'fk', name: c.ref.name, cols: [c.name], ref: c.ref.table, refCols: c.ref.col ? [c.ref.col] : undefined })
      if (c.check) all.push({ k: 'check', name: c.check.name, expr: c.check.expr })
    })
    all.push(...constraints)
    // primero claves y UNIQUE, luego CHECK/DEFAULT y al final las claves foraneas (pueden apuntar a la propia tabla)
    const prio = (k: TableConstraint) => (k.k === 'pk' ? 0 : k.k === 'unique' ? 1 : k.k === 'fk' ? 3 : 2)
    all.sort((a, b) => prio(a) - prio(b))
    for (const k of all) this.addConstraint(t, k, idx, !addToExisting)
    return t
  }

  private addConstraint(t: Table, k: TableConstraint, idx: (n: string) => number, creating: boolean) {
    const tn = t.name
    if (k.k === 'pk') {
      if (t.pk) throw new SqlError(8110, `Cannot add multiple PRIMARY KEY constraints to table '${tn}'.`, 16, 0, true)
      const cols = k.cols.map(idx)
      for (const ci of cols) {
        if (t.cols[ci].nullable) {
          if (creating) t.cols[ci].nullable = false
          else throw new SqlError(8111, `Cannot define PRIMARY KEY constraint on nullable column in table '${tn}'.`, 16, 1, true, ['Could not create constraint or index. See previous errors.'])
        }
      }
      t.pk = { name: k.name ?? `PK__${tn}__${hash8(tn + cols.join(','))}`, cols }
      if (!creating) this.checkExistingUnique(t, t.pk)
      this.sortByPk(t)
    } else if (k.k === 'unique') {
      const cols = k.cols.map(idx)
      const u: KeyDef = { name: k.name ?? `UQ__${tn}__${hash8(tn + cols.join(',') + 'uq')}`, cols }
      if (!creating) this.checkExistingUnique(t, u)
      t.uniques.push(u)
    } else if (k.k === 'check') {
      const colName = colOfExpr(k.expr)
      const name = k.name ?? `CK__${tn}__${colName ?? 'x'}__${hash8(tn + exprText(k.expr))}`
      if (!creating) {
        for (const row of t.rows) {
          const v = evalExpr(k.expr, rowEnv(t, row, 'values'), this)
          if (truth(v) === false) throw new SqlError(547, `The ALTER TABLE statement conflicted with the CHECK constraint "${name}". The conflict occurred in database "${this.cur.name}", table "dbo.${tn}"${colName ? `, column '${colName}'` : ''}.`, 16, 0, true)
        }
      }
      t.checks.push({ name, expr: k.expr, col: colName })
    } else if (k.k === 'default') {
      const ci = idx(k.col)
      t.cols[ci].def = { name: k.name ?? `DF__${tn}__${t.cols[ci].name}__${hash8(tn + k.col + 'df')}`, expr: k.expr }
    } else {
      const cols = k.cols.map(idx)
      const name = k.name ?? `FK__${tn}__${t.cols[cols[0]].name}__${hash8(tn + k.cols.join(',') + 'fk')}`
      const selfRef = lc(k.ref.name) === lc(tn)
      const parent = selfRef ? t : this.getTable(k.ref, () => new SqlError(1767, `Foreign key '${name}' references invalid table '${k.ref.text}'.`, 16, 0, true, ['Could not create constraint or index. See previous errors.']))
      let refCols: number[]
      if (k.refCols) {
        refCols = k.refCols.map((n) => {
          const i = parent.cols.findIndex((c) => lc(c.name) === lc(n))
          if (i < 0) throw new SqlError(1769, `Foreign key '${name}' references invalid column '${n}' in referencing table '${tn}'.`, 16, 1, true, ['Could not create constraint or index. See previous errors.'])
          return i
        })
      } else {
        if (!parent.pk) throw new SqlError(1773, `Foreign key '${name}' has implicit reference to object '${parent.name}' which does not have a primary key defined on it.`, 16, 0, true, ['Could not create constraint or index. See previous errors.'])
        refCols = parent.pk.cols
      }
      if (refCols.length !== cols.length) throw new SqlError(8139, `Number of referencing columns in foreign key differs from number of referenced columns, table '${tn}'.`, 16, 0, true, ['Could not create constraint or index. See previous errors.'])
      const sameCols = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i])
      const candidate = (parent.pk && sameCols(parent.pk.cols, refCols)) || parent.uniques.some((u) => sameCols(u.cols, refCols))
      if (!candidate) {
        throw new SqlError(1776, `There are no primary or candidate keys in the referenced table '${parent.name}' that match the referencing column list in the foreign key '${name}'.`, 16, 0, true, ['Could not create constraint or index. See previous errors.'])
      }
      cols.forEach((ci, j) => {
        const a = t.cols[ci].ty
        const b = parent.cols[refCols[j]].ty
        const same = a.k === b.k && typeName(a) === typeName(b) && (a.k !== 'dec' || (b.k === 'dec' && a.s === b.s))
        if (!same) throw new SqlError(1778, `Column '${parent.name}.${parent.cols[refCols[j]].name}' is not the same data type as referencing column '${tn}.${t.cols[ci].name}' in foreign key '${name}'.`, 16, 0, true, ['Could not create constraint or index. See previous errors.'])
      })
      if (!creating) {
        for (const row of t.rows) {
          const vals = cols.map((c) => row[c])
          if (vals.some((v) => v === null)) continue
          if (!parent.rows.some((pr) => refCols.every((rc, j) => eqKey(pr[rc]) === eqKey(vals[j])))) {
            throw new SqlError(547, `The ALTER TABLE statement conflicted with the FOREIGN KEY constraint "${name}". The conflict occurred in database "${this.cur.name}", table "dbo.${parent.name}", column '${parent.cols[refCols[0]].name}'.`, 16, 0, true)
          }
        }
      }
      t.fks.push({ name, cols, refTable: lc(parent.name), refCols })
    }
  }

  private checkExistingUnique(t: Table, k: KeyDef) {
    const seen = new Set<string>()
    for (const row of t.rows) {
      const key = k.cols.map((c) => eqKey(row[c])).join('|')
      if (seen.has(key)) {
        const vals = k.cols.map((c) => fmtV({ t: t.cols[c].ty, v: row[c] })).join(', ')
        throw new SqlError(1505, `The CREATE UNIQUE INDEX statement terminated because a duplicate key was found for the object name 'dbo.${t.name}' and the index name '${k.name}'. The duplicate key value is (${vals}).`, 16, 1, true, ['Could not create constraint or index. See previous errors.'])
      }
      seen.add(key)
    }
  }

  private createTable(st: Extract<Stmt, { k: 'createTable' }>) {
    const db = this.dbOf(st.table)
    if (db.tables.has(lc(st.table.name))) throw new SqlError(2714, `There is already an object named '${st.table.name}' in the database.`, 16, 6, true)
    const self: Table = { name: st.table.name, cols: [], rows: [], uniques: [], fks: [], checks: [], identNext: null, identityInsert: false }
    // la tabla se registra antes para permitir claves foraneas hacia si misma, y se quita si algo falla
    db.tables.set(lc(st.table.name), self)
    try {
      this.buildTable(st.table.name, st.cols, st.constraints, self, false)
    } catch (e) {
      db.tables.delete(lc(st.table.name))
      throw e
    }
  }

  // ------------------------------------------------------------ ALTER TABLE
  private alterTarget(tn: TableName): Table {
    return this.getTable(tn, () => new SqlError(4902, `Cannot find the object "${tn.name}" because it does not exist or you do not have permissions.`, 16, 1, true))
  }

  private alterAdd(st: Extract<Stmt, { k: 'alterAdd' }>) {
    const t = this.alterTarget(st.table)
    const snapshot = structuredClone({ cols: t.cols, rows: t.rows, pk: t.pk, uniques: t.uniques, fks: t.fks, checks: t.checks, identNext: t.identNext })
    try {
      const before = t.cols.length
      for (const c of st.cols) {
        if (c.identity) throw new SqlError(0, 'El simulador no soporta agregar una columna IDENTITY con ALTER TABLE.', 16, 1, true)
        const nullable = c.nullable ?? true
        if (!nullable && t.rows.length > 0 && !c.def) {
          throw new SqlError(4901, `ALTER TABLE only allows columns to be added that can contain nulls, or have a DEFAULT definition specified, or the column being added is an identity or timestamp column, or alternatively if none of the previous conditions are satisfied the table must be empty to allow addition of this column. Column '${c.name}' cannot be added to non-empty table '${t.name}' because it does not satisfy these conditions.`, 16, 1, true)
        }
      }
      this.buildTable(t.name, st.cols, st.constraints, t, true)
      // valores de las filas existentes
      for (let i = before; i < t.cols.length; i++) {
        const c = t.cols[i]
        let fill: Cell = null
        if (c.def) fill = coerce(evalExpr(c.def.expr, { cols: [], row: null, phase: 'values' }, this), c.ty)
        for (const r of t.rows) r.push(fill)
      }
    } catch (e) {
      t.cols = snapshot.cols
      t.rows = snapshot.rows
      t.pk = snapshot.pk
      t.uniques = snapshot.uniques
      t.fks = snapshot.fks
      t.checks = snapshot.checks
      t.identNext = snapshot.identNext
      throw e
    }
  }

  private colDependency(t: Table, ci: number): string | null {
    if (t.pk?.cols.includes(ci)) return t.pk.name
    const u = t.uniques.find((x) => x.cols.includes(ci))
    if (u) return u.name
    const f = t.fks.find((x) => x.cols.includes(ci))
    if (f) return f.name
    const ck = t.checks.find((c) => c.col && lc(c.col) === lc(t.cols[ci].name))
    if (ck) return ck.name
    if (t.cols[ci].def) return t.cols[ci].def!.name
    for (const o of this.cur.tables.values()) {
      const f2 = o.fks.find((x) => x.refTable === lc(t.name) && x.refCols.includes(ci))
      if (f2) return f2.name
    }
    return null
  }

  private alterDropCol(st: Extract<Stmt, { k: 'alterDropCol' }>) {
    const t = this.alterTarget(st.table)
    const idxs = st.cols.map((c) => {
      const i = t.cols.findIndex((x) => lc(x.name) === lc(c))
      if (i < 0) throw new SqlError(4924, `ALTER TABLE DROP COLUMN failed because column '${c}' does not exist in table '${t.name}'.`, 16, 1, true)
      return i
    })
    for (const i of idxs) {
      const dep = this.colDependency(t, i)
      if (dep) throw new SqlError(5074, `The object '${dep}' is dependent on column '${t.cols[i].name}'.`, 16, 1, true, [`ALTER TABLE DROP COLUMN ${t.cols[i].name} failed because one or more objects access this column.`])
    }
    if (idxs.length >= t.cols.length) throw new SqlError(4923, `ALTER TABLE DROP COLUMN failed because '${t.cols[idxs[0]].name}' is the only data column in table '${t.name}'. A table must have at least one data column.`, 16, 1, true)
    const drop = new Set(idxs)
    const remap = (i: number) => i - [...drop].filter((d) => d < i).length
    t.cols = t.cols.filter((_, i) => !drop.has(i))
    t.rows = t.rows.map((r) => r.filter((_, i) => !drop.has(i)))
    if (t.pk) t.pk.cols = t.pk.cols.map(remap)
    t.uniques.forEach((u) => (u.cols = u.cols.map(remap)))
    t.fks.forEach((f) => (f.cols = f.cols.map(remap)))
    for (const o of this.cur.tables.values()) o.fks.forEach((f) => { if (f.refTable === lc(t.name)) f.refCols = f.refCols.map(remap) })
  }

  private alterDropConstraint(st: Extract<Stmt, { k: 'alterDropConstraint' }>) {
    const t = this.alterTarget(st.table)
    const n = lc(st.name)
    if (t.pk && lc(t.pk.name) === n) {
      for (const o of this.cur.tables.values()) {
        const f = o.fks.find((x) => x.refTable === lc(t.name) && o !== t)
        if (f) throw new SqlError(3725, `The constraint '${t.pk.name}' is being referenced by table '${o.name}', foreign key constraint '${f.name}'.`, 16, 0, true, ['Could not drop constraint. See previous errors.'])
      }
      t.pk = undefined
      return
    }
    const ui = t.uniques.findIndex((u) => lc(u.name) === n)
    if (ui >= 0) {
      t.uniques.splice(ui, 1)
      return
    }
    const fi = t.fks.findIndex((f) => lc(f.name) === n)
    if (fi >= 0) {
      t.fks.splice(fi, 1)
      return
    }
    const ci = t.checks.findIndex((c) => lc(c.name) === n)
    if (ci >= 0) {
      t.checks.splice(ci, 1)
      return
    }
    const di = t.cols.findIndex((c) => c.def && lc(c.def.name) === n)
    if (di >= 0) {
      t.cols[di].def = undefined
      return
    }
    throw new SqlError(3728, `'${st.name}' is not a constraint.`, 16, 1, true, ['Could not drop constraint. See previous errors.'])
  }

  private alterCol(st: Extract<Stmt, { k: 'alterCol' }>) {
    const t = this.alterTarget(st.table)
    const ci = t.cols.findIndex((c) => lc(c.name) === lc(st.col))
    if (ci < 0) throw new SqlError(4917, `Column '${st.col}' does not exist in table '${t.name}'.`, 16, 1, true)
    const dep = this.colDependency(t, ci)
    if (dep && !(t.cols[ci].def && t.cols[ci].def!.name === dep)) {
      throw new SqlError(5074, `The object '${dep}' is dependent on column '${t.cols[ci].name}'.`, 16, 1, true, [`ALTER TABLE ALTER COLUMN ${t.cols[ci].name} failed because one or more objects access this column.`])
    }
    // al no indicar NULL ni NOT NULL, la columna queda como NULL (comportamiento por defecto de SQL Server)
    const nullable = st.nullable ?? true
    const ctx = { table: this.disp(t), col: t.cols[ci].name }
    const converted = t.rows.map((r) => {
      const c = r[ci] === null ? null : coerce({ t: t.cols[ci].ty, v: r[ci] }, st.ty, ctx)
      if (c === null && !nullable) throw new SqlError(515, `Cannot insert the value NULL into column '${t.cols[ci].name}', table '${this.disp(t)}'; column does not allow nulls. UPDATE fails.`, 16, 2, true, [TERMINATED])
      return c
    })
    t.rows.forEach((r, i) => (r[ci] = converted[i]))
    t.cols[ci].ty = st.ty
    t.cols[ci].nullable = nullable
  }

  // ------------------------------------------------------------ DROP / TRUNCATE / RENAME
  private dropTable(st: Extract<Stmt, { k: 'dropTable' }>) {
    const targets: Table[] = []
    for (const tn of st.tables) {
      const db = this.dbOf(tn)
      const t = db.tables.get(lc(tn.name))
      if (!t) {
        if (st.ifExists) continue
        throw new SqlError(3701, `Cannot drop the table '${tn.name}', because it does not exist or you do not have permission.`, 11, 5, true)
      }
      targets.push(t)
    }
    const names = new Set(targets.map((t) => lc(t.name)))
    for (const t of targets) {
      for (const o of this.cur.tables.values()) {
        if (names.has(lc(o.name))) continue
        if (o.fks.some((f) => f.refTable === lc(t.name))) throw new SqlError(3726, `Could not drop object '${t.name}' because it is referenced by a FOREIGN KEY constraint.`, 16, 1, true)
      }
    }
    for (const t of targets) this.cur.tables.delete(lc(t.name))
  }

  private truncate(st: Extract<Stmt, { k: 'truncate' }>) {
    const t = this.getTable(st.table, () => new SqlError(4701, `Cannot find the object "${st.table.name}" because it does not exist or you do not have permissions.`, 14, 1, true))
    for (const o of this.cur.tables.values()) {
      if (o.fks.some((f) => f.refTable === lc(t.name))) throw new SqlError(4712, `Cannot truncate table '${t.name}' because it is being referenced by a FOREIGN KEY constraint.`, 16, 1, true)
    }
    t.rows = []
    const idc = t.cols.find((c) => c.identity)
    if (idc) t.identNext = idc.identity!.seed
  }

  private rename(st: Extract<Stmt, { k: 'rename' }>) {
    const caution = 'Caution: Changing any part of an object name could break scripts and stored procedures.'
    const kind = (st.kind ?? '').toUpperCase()
    const parts = st.obj.split('.').map((p) => p.replace(/^\[|\]$/g, ''))
    if (kind === 'COLUMN') {
      if (parts.length < 2) throw new SqlError(15248, "Either the parameter @objname is ambiguous or the claimed @objtype (COLUMN) is wrong.", 11, 1, true)
      const col = parts[parts.length - 1]
      const tname = parts[parts.length - 2]
      const t = this.cur.tables.get(lc(tname))
      const ci = t ? t.cols.findIndex((c) => lc(c.name) === lc(col)) : -1
      if (!t || ci < 0) throw new SqlError(15248, "Either the parameter @objname is ambiguous or the claimed @objtype (COLUMN) is wrong.", 11, 1, true)
      if (t.cols.some((c, i) => i !== ci && lc(c.name) === lc(st.to))) throw new SqlError(15335, `Error: The new name '${st.to}' is already in use as a COLUMN name and would cause a duplicate that is not permitted.`, 11, 1, true)
      t.cols[ci].name = st.to
      this.msg(caution)
      return
    }
    if (kind !== '' && kind !== 'OBJECT') throw new SqlError(0, `sp_rename @objtype = '${st.kind}' no está soportado en el simulador.`, 16, 1, true)
    const name = parts[parts.length - 1]
    const t = this.cur.tables.get(lc(name))
    if (!t) throw new SqlError(15225, `No item by the name of '${st.obj}' could be found in the current database '${this.cur.name}', given that @itemtype was input as '(null)'.`, 11, 1, true)
    if (this.cur.tables.has(lc(st.to)) && lc(st.to) !== lc(name)) throw new SqlError(15335, `Error: The new name '${st.to}' is already in use as a OBJECT name and would cause a duplicate that is not permitted.`, 11, 1, true)
    this.cur.tables.delete(lc(name))
    t.name = st.to
    this.cur.tables.set(lc(st.to), t)
    for (const o of this.cur.tables.values()) o.fks.forEach((f) => { if (f.refTable === lc(name)) f.refTable = lc(st.to) })
    this.msg(caution)
  }

  // ------------------------------------------------------------ orden fisico (indice agrupado de la PK)
  private sortByPk(t: Table) {
    if (!t.pk) return
    const cols = t.pk.cols
    const idx = t.rows.map((r, i) => [r, i] as const)
    idx.sort((a, b) => {
      for (const c of cols) {
        const x = cellCmp(a[0][c], b[0][c], t.cols[c].ty)
        if (x !== 0) return x
      }
      return a[1] - b[1]
    })
    t.rows = idx.map((x) => x[0])
  }

  // ------------------------------------------------------------ INSERT
  private insert(st: Extract<Stmt, { k: 'insert' }>) {
    const t = this.getTable(st.table)
    if (this.cur.tables.get(lc(t.name)) !== t) throw new SqlError(208, `Invalid object name '${st.table.text}'.`, 16, 1, true)
    const ctxTable = this.disp(t)
    let targets: number[]
    if (st.cols) {
      targets = st.cols.map((n) => this.colIndex(t, n))
      const dup = targets.find((x, i) => targets.indexOf(x) !== i)
      if (dup !== undefined) throw new SqlError(264, `The column name '${t.cols[dup].name}' is specified more than once in the SET clause or column list of an INSERT. A column cannot be assigned more than one value in the same clause. Modify the clause to make sure that a column is updated only once. If this statement updates or inserts columns into a view, column aliasing can conceal the duplication in your code.`, 16, 1, true)
    } else {
      targets = t.cols.map((_, i) => i).filter((i) => !(t.cols[i].identity && !t.identityInsert))
    }
    for (const row of st.rows) {
      if (row.length !== targets.length) {
        if (st.cols) {
          if (row.length > targets.length) throw new SqlError(110, 'There are fewer columns in the INSERT statement than values specified in the VALUES clause. The number of values in the VALUES clause must match the number of columns specified in the INSERT statement.', 15, 1, true)
          throw new SqlError(109, 'There are more columns in the INSERT statement than values specified in the VALUES clause. The number of values in the VALUES clause must match the number of columns specified in the INSERT statement.', 15, 1, true)
        }
        throw new SqlError(213, 'Column name or number of supplied values does not match table definition.', 16, 1, true)
      }
    }
    const added: Cell[][] = []
    for (const vals of st.rows) {
      const row: Cell[] = new Array(t.cols.length).fill(null)
      const provided = new Set<number>()
      targets.forEach((ci, j) => {
        const e = vals[j]
        const col = t.cols[ci]
        if (col.identity && !t.identityInsert) throw new SqlError(544, `Cannot insert explicit value for identity column in table '${t.name}' when IDENTITY_INSERT is set to OFF.`, 16, 1, true)
        if (e === 'default') return
        const v = evalExpr(e, { cols: [], row: null, phase: 'values' }, this)
        row[ci] = coerce(v, col.ty, { table: ctxTable, col: col.name })
        provided.add(ci)
        if (col.identity && t.identityInsert && row[ci] !== null) {
          const n = row[ci] as number
          if (col.identity.inc > 0 ? n >= (t.identNext ?? 0) : n <= (t.identNext ?? 0)) t.identNext = n + col.identity.inc
        }
      })
      t.cols.forEach((col, ci) => {
        if (provided.has(ci)) return
        if (col.identity) {
          if (t.identityInsert && targets.includes(ci)) return
          row[ci] = t.identNext
          t.identNext = (t.identNext ?? col.identity.seed) + col.identity.inc
        } else if (col.def) {
          row[ci] = coerce(evalExpr(col.def.expr, { cols: [], row: null, phase: 'values' }, this), col.ty, { table: ctxTable, col: col.name })
        }
      })
      this.validateRow(t, row, 'INSERT', [...t.rows, ...added], added.length)
      added.push(row)
      this.work()
    }
    t.rows.push(...added)
    this.sortByPk(t)
    this.affected(added.length)
  }

  /** NOT NULL, claves, CHECK y claves foraneas de una fila nueva o modificada. `others` = filas contra las que no debe chocar. */
  private validateRow(t: Table, row: Cell[], op: 'INSERT' | 'UPDATE', others: Cell[][], _n: number, skipSelf?: Cell[]) {
    const db = this.cur
    t.cols.forEach((c, i) => {
      if (row[i] === null && !c.nullable) throw new SqlError(515, `Cannot insert the value NULL into column '${c.name}', table '${this.disp(t)}'; column does not allow nulls. ${op} fails.`, 16, 2)
    })
    const dupCheck = (k: KeyDef, kind: 'PRIMARY KEY' | 'UNIQUE KEY') => {
      const key = k.cols.map((c) => eqKey(row[c])).join('|')
      for (const o of others) {
        if (o === skipSelf) continue
        if (k.cols.map((c) => eqKey(o[c])).join('|') === key) {
          const vals = k.cols.map((c) => fmtV({ t: t.cols[c].ty, v: row[c] })).join(', ')
          throw new SqlError(2627, `Violation of ${kind} constraint '${k.name}'. Cannot insert duplicate key in object 'dbo.${t.name}'. The duplicate key value is (${vals}).`, 14, 1)
        }
      }
    }
    if (t.pk) dupCheck(t.pk, 'PRIMARY KEY')
    for (const u of t.uniques) dupCheck(u, 'UNIQUE KEY')
    for (const ck of t.checks) {
      const v = evalExpr(ck.expr, rowEnv(t, row, 'values'), this)
      if (truth(v) === false) {
        throw new SqlError(547, `The ${op} statement conflicted with the CHECK constraint "${ck.name}". The conflict occurred in database "${db.name}", table "dbo.${t.name}"${ck.col ? `, column '${ck.col}'` : ''}.`, 16, 0)
      }
    }
    for (const f of t.fks) {
      const vals = f.cols.map((c) => row[c])
      if (vals.some((v) => v === null)) continue
      const parent = db.tables.get(f.refTable)
      const rows = parent === t ? [...others, row] : parent?.rows ?? []
      if (!rows.some((pr) => f.refCols.every((rc, j) => eqKey(pr[rc]) === eqKey(vals[j])))) {
        throw new SqlError(547, `The ${op} statement conflicted with the FOREIGN KEY constraint "${f.name}". The conflict occurred in database "${db.name}", table "dbo.${parent?.name ?? f.refTable}", column '${parent?.cols[f.refCols[0]].name ?? ''}'.`, 16, 0)
      }
    }
  }

  // ------------------------------------------------------------ UPDATE
  private update(st: Extract<Stmt, { k: 'update' }>) {
    const t = this.getTable(st.table)
    const sets = st.sets.map((s) => {
      const ci = this.colIndex(t, s.col)
      if (t.cols[ci].identity) throw new SqlError(8102, `Cannot update identity column '${t.cols[ci].name}'.`, 16, 1, true)
      return { ci, expr: s.expr }
    })
    if (st.where && hasAgg(st.where)) throw aggInWhere()
    const matched: number[] = []
    t.rows.forEach((r, i) => {
      this.work()
      if (!st.where || truth(evalExpr(st.where, rowEnv(t, r, 'where', st.table.name), this)) === true) matched.push(i)
    })
    const oldRows = matched.map((i) => t.rows[i])
    const newRows = oldRows.map((old) => {
      const nr = old.slice()
      for (const s of sets) {
        const v = evalExpr(s.expr, rowEnv(t, old, 'values', st.table.name), this)
        nr[s.ci] = coerce(v, t.cols[s.ci].ty, { table: this.disp(t), col: t.cols[s.ci].name })
      }
      return nr
    })
    const unchanged = t.rows.filter((_, i) => !matched.includes(i))
    newRows.forEach((nr, k) => this.validateRow(t, nr, 'UPDATE', [...unchanged, ...newRows.slice(0, k), ...newRows.slice(k + 1)], 0))
    // claves referenciadas por otras tablas
    const db = this.cur
    for (const o of db.tables.values()) {
      for (const f of o.fks) {
        if (f.refTable !== lc(t.name)) continue
        oldRows.forEach((old, k) => {
          const oldKey = f.refCols.map((c) => eqKey(old[c])).join('|')
          const newKey = f.refCols.map((c) => eqKey(newRows[k][c])).join('|')
          if (oldKey === newKey) return
          const inUse = o.rows.some((cr) => !(o === t && oldRows.includes(cr)) && f.cols.map((c) => eqKey(cr[c])).join('|') === oldKey)
          if (inUse) throw new SqlError(547, `The UPDATE statement conflicted with the REFERENCE constraint "${f.name}". The conflict occurred in database "${db.name}", table "dbo.${o.name}", column '${o.cols[f.cols[0]].name}'.`, 16, 0)
        })
      }
    }
    matched.forEach((i, k) => (t.rows[i] = newRows[k]))
    this.sortByPk(t)
    this.affected(matched.length)
  }

  // ------------------------------------------------------------ DELETE
  private del(st: Extract<Stmt, { k: 'delete' }>) {
    const t = this.getTable(st.table)
    if (st.where && hasAgg(st.where)) throw aggInWhere()
    const gone = t.rows.filter((r) => {
      this.work()
      return !st.where || truth(evalExpr(st.where, rowEnv(t, r, 'where', st.table.name), this)) === true
    })
    const db = this.cur
    for (const o of db.tables.values()) {
      for (const f of o.fks) {
        if (f.refTable !== lc(t.name)) continue
        for (const g of gone) {
          const key = f.refCols.map((c) => eqKey(g[c])).join('|')
          if (o.rows.some((cr) => !(o === t && gone.includes(cr)) && f.cols.map((c) => eqKey(cr[c])).join('|') === key)) {
            throw new SqlError(547, `The DELETE statement conflicted with the REFERENCE constraint "${f.name}". The conflict occurred in database "${db.name}", table "dbo.${o.name}", column '${o.cols[f.cols[0]].name}'.`, 16, 0)
          }
        }
      }
    }
    t.rows = t.rows.filter((r) => !gone.includes(r))
    this.affected(gone.length)
  }

  // ------------------------------------------------------------ SELECT
  private select(st: SelectStmt) {
    this.warnNull = false
    let cols: ColInfo[] = []
    let rows: Cell[][] = [[]]
    let sourceName = ''
    if (st.from) {
      const t = this.getTable(st.from.table)
      const alias = lc(st.from.alias ?? st.from.table.name)
      sourceName = st.from.alias ?? t.name
      cols = t.cols.map((c) => ({ name: c.name, ty: c.ty, table: alias, tdisp: sourceName }))
      rows = t.rows
    }
    const env0 = (row: Cell[] | null, phase: Phase): Env => ({ cols, row, phase })

    if (st.where) {
      if (hasAgg(st.where)) throw aggInWhere()
      const where = st.where
      rows = rows.filter((r) => {
        this.work()
        return truth(evalExpr(where, env0(r, 'where'), this)) === true
      })
    }

    // lista de seleccion
    const sel: { name: string; expr: Expr; alias?: string }[] = []
    for (const it of st.items) {
      if (it.star) {
        if (!st.from) throw new SqlError(1038, 'An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as "" or [] are not allowed. Change the alias to a valid name.', 15, 1, true)
        if (it.starOf && lc(it.starOf) !== cols[0]?.table) throw new SqlError(4104, `The multi-part identifier "${it.starOf}.*" could not be bound.`, 16, 1, true)
        for (const c of cols) sel.push({ name: c.name, expr: { k: 'col', name: c.name } })
      } else {
        const e = it.expr!
        sel.push({ name: it.alias ?? (e.k === 'col' ? cols.find((c) => lc(c.name) === lc(e.name))?.name ?? e.name : ''), expr: e, alias: it.alias })
      }
    }

    const grouping = !!st.groupBy || sel.some((s) => hasAgg(s.expr)) || (st.having ? hasAgg(st.having) : false)
    if (st.groupBy?.some(hasAgg)) throw new SqlError(144, 'Cannot use an aggregate or a subquery in an expression used for the group by list of a GROUP BY clause.', 15, 1, true)
    if (st.having && !grouping) throw new SqlError(8121, 'Column is invalid in the HAVING clause because it is not contained in either an aggregate function or the GROUP BY clause.', 16, 1, true)

    // ORDER BY: posicion, alias o expresion
    const order = (st.orderBy ?? []).map((o) => {
      const expr = o.e
      let pos = -1
      if (expr.k === 'lit' && expr.v.t.k === 'int') {
        const n = expr.v.v as number
        if (n < 1 || n > sel.length) throw new SqlError(108, `The ORDER BY position number ${n} is out of range of the number of items in the select list.`, 15, 1, true)
        pos = n - 1
      } else if (expr.k === 'col' && !expr.table) {
        const colName = expr.name
        pos = sel.findIndex((s) => s.alias !== undefined && lc(s.alias) === lc(colName))
      }
      if (pos < 0 && st.distinct) {
        const key = exprKey(expr)
        pos = sel.findIndex((s) => exprKey(s.expr) === key)
        if (pos < 0) throw new SqlError(145, 'ORDER BY items must appear in the select list if SELECT DISTINCT is specified.', 15, 1, true)
      }
      return { pos, expr, desc: o.desc }
    })

    type Out = { vals: V[]; keys: V[] }
    const outs: Out[] = []
    const keyOf = (env: Env, vals: V[]): V[] => order.map((o) => (o.pos >= 0 ? vals[o.pos] : evalExpr(o.expr, { ...env, phase: 'order' }, this)))

    if (!grouping) {
      for (const r of rows) {
        this.work()
        const env = env0(r, 'select')
        const vals = sel.map((s) => evalExpr(s.expr, env, this))
        outs.push({ vals, keys: keyOf(env, vals) })
      }
    } else {
      const groups: { rows: Cell[][] }[] = []
      if (st.groupBy) {
        const map = new Map<string, { rows: Cell[][] }>()
        for (const r of rows) {
          this.work()
          const key = st.groupBy.map((g) => eqKey(evalExpr(g, env0(r, 'select'), this).v)).join('|')
          let g = map.get(key)
          if (!g) {
            g = { rows: [] }
            map.set(key, g)
            groups.push(g)
          }
          g.rows.push(r)
        }
      } else groups.push({ rows })
      for (const g of groups) {
        const env: Env = { cols, row: g.rows[0] ?? null, group: g.rows, groupKeys: st.groupBy ?? [], phase: 'select' }
        if (st.having && truth(evalExpr(st.having, { ...env, phase: 'having' }, this)) !== true) continue
        const vals = sel.map((s) => evalExpr(s.expr, env, this))
        outs.push({ vals, keys: keyOf(env, vals) })
      }
    }
    if (this.warnNull) this.msg('Warning: Null value is eliminated by an aggregate or other SET operation.')

    let res = outs
    if (st.distinct) {
      const seen = new Set<string>()
      res = res.filter((o) => {
        const k = o.vals.map((v) => eqKey(v.v)).join('|')
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    }
    if (order.length) {
      const idx = res.map((o, i) => [o, i] as const)
      idx.sort((a, b) => {
        for (let k = 0; k < order.length; k++) {
          const x = a[0].keys[k]
          const y = b[0].keys[k]
          let c: number
          if (x.v === null && y.v === null) c = 0
          else if (x.v === null) c = -1
          else if (y.v === null) c = 1
          else c = compare(x, y) ?? 0
          if (c !== 0) return order[k].desc ? -c : c
        }
        return a[1] - b[1]
      })
      res = idx.map((x) => x[0])
    }
    const num = (e: Expr | undefined, what: string): number | undefined => {
      if (!e) return undefined
      const v = evalExpr(e, { cols: [], row: null, phase: 'values' }, this)
      if (v.v === null || typeof v.v !== 'number' || v.t.k === 'dec' || v.t.k === 'float') throw new SqlError(1060, `The number of rows provided for a ${what} clause row count parameter must be an integer.`, 15, 1, true)
      if (v.v < 0) throw new SqlError(1031, `Percent values must be between 0 and 100.`, 15, 1, true)
      return v.v
    }
    const offset = num(st.offset, 'OFFSET') ?? 0
    const fetch = num(st.fetch, 'FETCH')
    const top = num(st.top, 'TOP')
    if (offset || fetch !== undefined) res = res.slice(offset, fetch !== undefined ? offset + fetch : undefined)
    if (top !== undefined) res = res.slice(0, top)

    const set: ResultSet = {
      cols: sel.map((s, i) => ({ name: s.name, t: res[0]?.vals[i].t ?? inferTy(s.expr, cols) })),
      rows: res.map((o) => o.vals.map(fmtV)),
      ordered: !!st.orderBy,
    }
    this.events.push({ k: 'set', set })
    this.affected(res.length)
  }

  // usados por el evaluador
  noteNull() {
    this.warnNull = true
  }
}

// ---------------------------------------------------------------- utilidades de filas/expresiones

function aggInWhere() {
  return new SqlError(147, 'An aggregate may not appear in the WHERE clause unless it is in a subquery contained in a HAVING clause or a select list, and the column being aggregated is an outer reference.', 15, 1, true)
}

function rowEnv(t: Table, row: Cell[], phase: Phase, alias?: string): Env {
  const a = lc(alias ?? t.name)
  return { cols: t.cols.map((c) => ({ name: c.name, ty: c.ty, table: a, tdisp: alias ?? t.name })), row, phase }
}

function cellCmp(a: Cell, b: Cell, ty: Ty): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? -1 : 1
  if (typeof a === 'string' && typeof b === 'string') return ty.k === 'date' || ty.k === 'datetime' ? (a < b ? -1 : a > b ? 1 : 0) : cmpStr(a, b)
  return (a as number) < (b as number) ? -1 : (a as number) > (b as number) ? 1 : 0
}

function colOfExpr(e: Expr): string | undefined {
  if (e.k === 'col') return e.name
  if (e.k === 'bin') return colOfExpr(e.l) ?? colOfExpr(e.r)
  if (e.k === 'un' || e.k === 'isnull') return colOfExpr(e.e)
  if (e.k === 'between' || e.k === 'in' || e.k === 'like') return colOfExpr(e.e)
  if (e.k === 'fn') return e.args.map(colOfExpr).find(Boolean)
  return undefined
}

export function exprText(e: Expr): string {
  switch (e.k) {
    case 'lit':
      return e.v.v === null ? 'NULL' : typeof e.v.v === 'string' ? `'${e.v.v}'` : String(e.v.v)
    case 'col':
      return `[${e.name}]`
    case 'bin':
      return `${exprText(e.l)}${e.op === 'AND' || e.op === 'OR' ? ` ${e.op} ` : e.op}${exprText(e.r)}`
    case 'un':
      return `${e.op === 'NOT' ? 'NOT ' : e.op}${exprText(e.e)}`
    case 'fn':
      return `${e.name.toLowerCase()}(${e.star ? '*' : e.args.map(exprText).join(',')})`
    default:
      return '(...)'
  }
}

function inferTy(e: Expr, cols: ColInfo[]): Ty {
  if (e.k === 'col') return cols.find((c) => lc(c.name) === lc(e.name))?.ty ?? { k: 'null' }
  if (e.k === 'lit') return e.v.t
  if (e.k === 'fn' && lc(e.name) === 'count') return INT
  if (e.k === 'cast') return e.ty
  return { k: 'null' }
}

// ---------------------------------------------------------------- evaluador de expresiones

function colLookup(e: Extract<Expr, { k: 'col' }>, env: Env): V {
  const found = env.cols.findIndex((c) => lc(c.name) === lc(e.name) && (!e.table || c.table === lc(e.table)))
  if (found < 0) {
    if (e.table && env.cols.some((c) => lc(c.name) === lc(e.name))) throw new SqlError(4104, `The multi-part identifier "${e.table}.${e.name}" could not be bound.`, 16, 1, true)
    if (e.table && !env.cols.some((c) => c.table === lc(e.table!))) throw new SqlError(4104, `The multi-part identifier "${e.table}.${e.name}" could not be bound.`, 16, 1, true)
    throw new SqlError(207, `Invalid column name '${e.name}'.`, 16, 1, true)
  }
  const ci = env.cols[found]
  return { t: ci.ty, v: env.row ? env.row[found] : null }
}

export function evalExpr(e: Expr, env: Env, srv: Server): V {
  if (env.groupKeys && e.k !== 'lit') {
    if (e.k === 'fn' && isAggregate(e.name)) return evalAgg(e, env, srv)
    if (env.groupKeys.some((g) => exprKey(g) === exprKey(e))) return evalExpr(e, { ...env, groupKeys: undefined, group: undefined }, srv)
    if (e.k === 'col') {
      colLookup(e, env) // si la columna no existe, ese es el error
      const where = env.phase === 'having' ? [8121, 'HAVING clause'] : env.phase === 'order' ? [8127, 'ORDER BY clause'] : [8120, 'select list']
      throw new SqlError(where[0] as number, `Column '${cols0(env, e)}' is invalid in the ${where[1]} because it is not contained in either an aggregate function or the GROUP BY clause.`, 16, 1, true)
    }
  }
  switch (e.k) {
    case 'lit':
      return e.v
    case 'col':
      return colLookup(e, env)
    case 'un': {
      const v = evalExpr(e.e, env, srv)
      if (e.op === 'NOT') {
        const t = truth(v)
        return boolV(t === null ? null : !t)
      }
      if (e.op === '+') return v
      return negate(v)
    }
    case 'bin': {
      if (e.op === 'AND' || e.op === 'OR') {
        const a = truth(evalExpr(e.l, env, srv))
        const b = truth(evalExpr(e.r, env, srv))
        if (e.op === 'AND') return boolV(a === false || b === false ? false : a === null || b === null ? null : true)
        return boolV(a === true || b === true ? true : a === null || b === null ? null : false)
      }
      const l = evalExpr(e.l, env, srv)
      const r = evalExpr(e.r, env, srv)
      if (['=', '<>', '<', '>', '<=', '>='].includes(e.op)) {
        const c = compare(l, r)
        if (c === null) return boolV(null)
        switch (e.op) {
          case '=':
            return boolV(c === 0)
          case '<>':
            return boolV(c !== 0)
          case '<':
            return boolV(c < 0)
          case '>':
            return boolV(c > 0)
          case '<=':
            return boolV(c <= 0)
          default:
            return boolV(c >= 0)
        }
      }
      return arith(e.op as '+' | '-' | '*' | '/' | '%', l, r)
    }
    case 'isnull': {
      const v = evalExpr(e.e, env, srv)
      return boolV(e.neg ? v.v !== null : v.v === null)
    }
    case 'in': {
      const v = evalExpr(e.e, env, srv)
      if (v.v === null) return boolV(null)
      let sawNull = false
      for (const it of e.list) {
        const c = compare(v, evalExpr(it, env, srv))
        if (c === null) sawNull = true
        else if (c === 0) return boolV(e.neg ? false : true)
      }
      if (sawNull) return boolV(null)
      return boolV(e.neg ? true : false)
    }
    case 'between': {
      const v = evalExpr(e.e, env, srv)
      const lo = compare(v, evalExpr(e.lo, env, srv))
      const hi = compare(v, evalExpr(e.hi, env, srv))
      const a = lo === null ? null : lo >= 0
      const b = hi === null ? null : hi <= 0
      const r = a === false || b === false ? false : a === null || b === null ? null : true
      return boolV(r === null ? null : e.neg ? !r : r)
    }
    case 'like': {
      const v = evalExpr(e.e, env, srv)
      const p = evalExpr(e.pat, env, srv)
      if (v.v === null || p.v === null) return boolV(null)
      const m = likeRegex(toStr(p)).test(toStr(v).replace(/\s+$/, ''))
      return boolV(e.neg ? !m : m)
    }
    case 'cast': {
      const v = evalExpr(e.e, env, srv)
      return { t: e.ty, v: coerce(v, e.ty) }
    }
    case 'fn':
      return callFn(e, env, srv)
  }
}

const cols0 = (env: Env, e: Extract<Expr, { k: 'col' }>) => {
  const c = env.cols.find((x) => lc(x.name) === lc(e.name))!
  return `${c.tdisp}.${c.name}`
}

function negate(v: V): V {
  if (v.v === null) return v
  if (typeof v.v === 'string') return arith('-', intV(0), v)
  return { t: v.t, v: -(v.v as number) }
}

function evalAgg(e: Extract<Expr, { k: 'fn' }>, env: Env, srv: Server): V {
  const rows = env.group
  if (!rows) throw aggInWhere()
  const name = e.name.toUpperCase()
  const arg = e.args[0]
  const inner: Env = { ...env, groupKeys: undefined, group: undefined, phase: 'select' }
  if (name === 'COUNT' && e.star) return intV(rows.length)
  if (!arg) throw new SqlError(174, `The ${name.toLowerCase()} function requires 1 argument(s).`, 15, 1, true)
  const vals: V[] = rows.map((r) => evalExpr(arg, { ...inner, row: r }, srv))
  const non = vals.filter((v) => v.v !== null)
  if (non.length < vals.length) srv.noteNull()
  const list = e.distinct ? [...new Map(non.map((v) => [eqKey(v.v), v])).values()] : non
  if (name === 'COUNT') return intV(list.length)
  const t0: Ty = vals[0]?.t ?? { k: 'null' }
  if (name === 'MIN' || name === 'MAX') {
    if (list.length === 0) return { t: t0, v: null }
    let best = list[0]
    for (const v of list) {
      const c = compare(v, best)
      if (c !== null && (name === 'MIN' ? c < 0 : c > 0)) best = v
    }
    return best
  }
  // SUM / AVG
  if (t0.k === 'str' || t0.k === 'bit' || t0.k === 'date' || t0.k === 'datetime') throw new SqlError(8117, `Operand data type ${typeName(t0)} is invalid for ${name.toLowerCase()} operator.`, 16, 1, true)
  if (list.length === 0) return { t: name === 'AVG' ? (t0.k === 'int' ? INT : t0) : sumType(t0), v: null }
  let total: V = list[0]
  total = { t: sumType(total.t), v: total.v }
  for (let i = 1; i < list.length; i++) total = arith('+', total, list[i])
  if (total.t.k === 'dec') total = { t: { k: 'dec', p: 38, s: total.t.s }, v: total.v }
  if (name === 'SUM') return total
  if (total.t.k === 'float') return { t: total.t, v: (total.v as number) / list.length }
  if (total.t.k === 'int') return { t: INT, v: Math.trunc((total.v as number) / list.length) }
  const q = arith('/', { t: { k: 'dec', p: 38, s: (total.t as { s: number }).s }, v: total.v }, intV(list.length))
  return q
}

function sumType(t: Ty): Ty {
  if (t.k === 'int') return t.n === 'bigint' ? t : { k: 'int', n: 'int' }
  if (t.k === 'dec') return { k: 'dec', p: 38, s: t.s }
  return t
}

function callFn(e: Extract<Expr, { k: 'fn' }>, env: Env, srv: Server): V {
  const name = e.name.toUpperCase()
  if (isAggregate(name)) {
    // agregado fuera de un contexto de grupo (p. ej. dentro de una funcion en WHERE)
    throw aggInWhere()
  }
  const need = (n: number) => {
    if (e.args.length < n) throw new SqlError(174, `The ${name.toLowerCase()} function requires ${n} argument(s).`, 15, 1, true)
  }
  const arg = (i: number) => evalExpr(e.args[i], env, srv)
  const num = (v: V) => {
    if (typeof v.v === 'number') return v.v
    return coerce(v, { k: 'float' }) as number
  }
  switch (name) {
    case 'UPPER':
    case 'LOWER': {
      need(1)
      const v = arg(0)
      if (v.v === null) return { t: v.t.k === 'str' ? v.t : strRes('').t, v: null }
      const s = toStr(v)
      return strRes(name === 'UPPER' ? s.toUpperCase() : s.toLowerCase(), v.t.k === 'str' && (v.t.n === 'nvarchar' || v.t.n === 'nchar') ? 'nvarchar' : 'varchar')
    }
    case 'LEN': {
      need(1)
      const v = arg(0)
      return intV(v.v === null ? (null as unknown as number) : toStr(v).replace(/\s+$/, '').length)
    }
    case 'LTRIM':
    case 'RTRIM':
    case 'TRIM': {
      need(1)
      const v = arg(0)
      if (v.v === null) return strRes(null)
      const s = toStr(v)
      return strRes(name === 'LTRIM' ? s.replace(/^\s+/, '') : name === 'RTRIM' ? s.replace(/\s+$/, '') : s.trim())
    }
    case 'SUBSTRING': {
      need(3)
      const v = arg(0)
      const a = arg(1)
      const b = arg(2)
      if (v.v === null || a.v === null || b.v === null) return strRes(null)
      const s = toStr(v)
      let start = Math.trunc(num(a))
      let len = Math.trunc(num(b))
      if (len < 0) throw new SqlError(536, 'Invalid length parameter passed to the substring function.', 16, 1, true)
      if (start < 1) {
        len += start - 1
        start = 1
      }
      return strRes(len <= 0 ? '' : s.substr(start - 1, len))
    }
    case 'LEFT':
    case 'RIGHT': {
      need(2)
      const v = arg(0)
      const n = arg(1)
      if (v.v === null || n.v === null) return strRes(null)
      const k = Math.trunc(num(n))
      if (k < 0) throw new SqlError(536, `Invalid length parameter passed to the ${name} function.`, 16, 1, true)
      const s = toStr(v)
      return strRes(name === 'LEFT' ? s.slice(0, k) : k === 0 ? '' : s.slice(-k))
    }
    case 'REPLACE': {
      need(3)
      const v = arg(0)
      const a = arg(1)
      const b = arg(2)
      if (v.v === null || a.v === null || b.v === null) return strRes(null)
      const find = toStr(a)
      if (find === '') return v
      return strRes(toStr(v).replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), () => toStr(b)))
    }
    case 'CONCAT': {
      need(2)
      return strRes(e.args.map((_, i) => arg(i)).map((v) => (v.v === null ? '' : toStr(v))).join(''))
    }
    case 'ISNULL': {
      need(2)
      const a = arg(0)
      if (a.v !== null) return a
      const b = arg(1)
      return { t: a.t.k === 'null' ? b.t : a.t, v: b.v === null ? null : a.t.k === 'null' ? b.v : coerce(b, a.t) }
    }
    case 'COALESCE': {
      need(2)
      const vs = e.args.map((_, i) => arg(i))
      const t = vs.reduce<Ty>((acc, v) => higherType(acc, v.t), { k: 'null' })
      const first = vs.find((v) => v.v !== null)
      if (!first) return { t, v: null }
      return { t, v: first.t === t ? first.v : coerce(first, t) }
    }
    case 'NULLIF': {
      need(2)
      const a = arg(0)
      const b = arg(1)
      return compare(a, b) === 0 ? { t: a.t, v: null } : a
    }
    case 'ROUND': {
      need(2)
      const v = arg(0)
      const n = arg(1)
      if (v.v === null) return v
      const d = Math.trunc(num(n))
      if (v.t.k === 'int') return v
      return { t: v.t, v: roundTo(num(v), d) }
    }
    case 'ABS':
    case 'CEILING':
    case 'FLOOR': {
      need(1)
      const v = arg(0)
      if (v.v === null) return v
      const x = num(v)
      const r = name === 'ABS' ? Math.abs(x) : name === 'CEILING' ? Math.ceil(x) : Math.floor(x)
      return { t: v.t.k === 'str' ? { k: 'float' } : v.t, v: r }
    }
    case 'GETDATE':
      return { t: { k: 'datetime' }, v: nowDatetime() }
    case 'YEAR':
    case 'MONTH':
    case 'DAY': {
      need(1)
      const v = arg(0)
      if (v.v === null) return { t: INT, v: null }
      const d = v.t.k === 'str' ? parseDate(v.v as string, 'datetime') : (v.v as string)
      const part = name === 'YEAR' ? d.slice(0, 4) : name === 'MONTH' ? d.slice(5, 7) : d.slice(8, 10)
      return intV(Number(part))
    }
    case 'CHARINDEX': {
      need(2)
      const a = arg(0)
      const b = arg(1)
      if (a.v === null || b.v === null) return { t: INT, v: null }
      return intV(toStr(b).toLowerCase().indexOf(toStr(a).toLowerCase()) + 1)
    }
    case 'REVERSE': {
      need(1)
      const v = arg(0)
      return strRes(v.v === null ? null : [...toStr(v)].reverse().join(''))
    }
    case 'REPLICATE': {
      need(2)
      const v = arg(0)
      const n = arg(1)
      if (v.v === null || n.v === null) return strRes(null)
      return strRes(toStr(v).repeat(Math.max(0, Math.trunc(num(n)))))
    }
    default:
      throw new SqlError(195, `'${e.name}' is not a recognized built-in function name.`, 15, 10, true)
  }
}

void BOOLT
void typeFull
void NULLV
