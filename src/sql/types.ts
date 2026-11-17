// Tipos del simulador T-SQL (subconjunto que se ensena en el curso de SQL).
// Puro TypeScript: lo usan el navegador (Vite) y Node (compilador de contenido).

export type Ty =
  | { k: 'int'; n: 'tinyint' | 'smallint' | 'int' | 'bigint' }
  | { k: 'bit' }
  | { k: 'dec'; p: number; s: number; kw?: 'numeric' }
  | { k: 'float' }
  | { k: 'str'; n: 'char' | 'varchar' | 'nchar' | 'nvarchar'; len: number } // len = Infinity => MAX
  | { k: 'date' }
  | { k: 'datetime' }
  | { k: 'bool' }
  | { k: 'null' }

export type Cell = number | string | null

/** Valor con tipo (resultado de evaluar una expresion). */
export interface V {
  t: Ty
  v: Cell
}

export class SqlError extends Error {
  constructor(
    public num: number,
    text: string,
    public level = 16,
    public state = 1,
    /** true: el error detiene el resto del lote (como los errores de compilacion o de nombres). */
    public stops = false,
    /** mensajes adicionales que SQL Server imprime despues (p. ej. "The statement has been terminated."). */
    public extra: string[] = [],
    public line = 0,
  ) {
    super(text)
  }
}

// ---------- AST ----------

export type Expr =
  | { k: 'lit'; v: V }
  | { k: 'col'; table?: string; name: string }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '%' | '=' | '<>' | '<' | '>' | '<=' | '>=' | 'AND' | 'OR'; l: Expr; r: Expr }
  | { k: 'un'; op: '-' | '+' | 'NOT'; e: Expr }
  | { k: 'isnull'; e: Expr; neg: boolean }
  | { k: 'in'; e: Expr; list: Expr[]; neg: boolean }
  | { k: 'between'; e: Expr; lo: Expr; hi: Expr; neg: boolean }
  | { k: 'like'; e: Expr; pat: Expr; neg: boolean }
  | { k: 'fn'; name: string; args: Expr[]; distinct?: boolean; star?: boolean }
  | { k: 'cast'; e: Expr; ty: Ty }

export interface TableName {
  db?: string
  schema?: string
  name: string
  /** como lo escribio el usuario (para los mensajes de error) */
  text: string
}

export interface SelectItem {
  star?: boolean
  starOf?: string
  expr?: Expr
  alias?: string
}

export interface SelectStmt {
  k: 'select'
  line: number
  distinct: boolean
  top?: Expr
  items: SelectItem[]
  from?: { table: TableName; alias?: string }
  where?: Expr
  groupBy?: Expr[]
  having?: Expr
  orderBy?: { e: Expr; desc: boolean }[]
  offset?: Expr
  fetch?: Expr
}

export interface ColDef {
  name: string
  ty: Ty
  /** undefined = no se escribio NULL ni NOT NULL */
  nullable?: boolean
  identity?: { seed: number; inc: number }
  def?: { name?: string; expr: Expr }
  pk?: { name?: string }
  unique?: { name?: string }
  ref?: { name?: string; table: TableName; col?: string }
  check?: { name?: string; expr: Expr }
}

export type TableConstraint =
  | { k: 'pk'; name?: string; cols: string[] }
  | { k: 'unique'; name?: string; cols: string[] }
  | { k: 'fk'; name?: string; cols: string[]; ref: TableName; refCols?: string[] }
  | { k: 'check'; name?: string; expr: Expr }
  | { k: 'default'; name?: string; expr: Expr; col: string }

export type Stmt =
  | SelectStmt
  | { k: 'createDb'; line: number; name: string }
  | { k: 'dropDb'; line: number; name: string; ifExists: boolean }
  | { k: 'use'; line: number; name: string }
  | { k: 'createTable'; line: number; table: TableName; cols: ColDef[]; constraints: TableConstraint[] }
  | { k: 'alterAdd'; line: number; table: TableName; cols: ColDef[]; constraints: TableConstraint[] }
  | { k: 'alterDropCol'; line: number; table: TableName; cols: string[] }
  | { k: 'alterDropConstraint'; line: number; table: TableName; name: string }
  | { k: 'alterCol'; line: number; table: TableName; col: string; ty: Ty; nullable?: boolean }
  | { k: 'dropTable'; line: number; tables: TableName[]; ifExists: boolean }
  | { k: 'truncate'; line: number; table: TableName }
  | { k: 'insert'; line: number; table: TableName; cols?: string[]; rows: (Expr | 'default')[][] }
  | { k: 'update'; line: number; table: TableName; sets: { col: string; expr: Expr }[]; where?: Expr }
  | { k: 'delete'; line: number; table: TableName; where?: Expr }
  | { k: 'rename'; line: number; obj: string; to: string; kind?: string }
  | { k: 'print'; line: number; text: Expr }
  | { k: 'identityInsert'; line: number; table: TableName; on: boolean }
  | { k: 'noop'; line: number; what: string }

// ---------- resultados ----------

export interface ResultSet {
  cols: { name: string; t: Ty }[]
  /** celdas ya formateadas como las muestra SSMS (NULL, decimales con su escala...) */
  rows: string[][]
  /** true si la consulta tenia ORDER BY (el orden importa al comparar) */
  ordered: boolean
}

export type SqlEvent =
  | { k: 'set'; set: ResultSet }
  | { k: 'msg'; text: string }
  | { k: 'error'; num: number; level: number; state: number; line: number; text: string }

export interface SqlRun {
  events: SqlEvent[]
  sets: ResultSet[]
  errors: { num: number; text: string }[]
  /** lineas comparables (resultados y numeros de error) */
  lines: string[]
  /** banderas "ordered" de cada conjunto de resultados, en orden */
  ordered: boolean[]
}
