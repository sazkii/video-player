declare module 'sql.js' {
  type BindParams = (string | number | Uint8Array | null)[]

  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number>) => Database
  }

  interface Database {
    run(sql: string, params?: BindParams): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
  }

  interface Statement {
    bind(params?: BindParams): boolean
    step(): boolean
    getAsObject(): Record<string, unknown>
    free(): void
  }

  interface QueryExecResult {
    columns: string[]
    values: unknown[][]
  }

  function initSqlJs(config?: {
    locateFile?: (filename: string) => string
  }): Promise<SqlJsStatic>

  namespace initSqlJs {
    export type { BindParams }
  }

  export default initSqlJs
  export type { Database, SqlJsStatic, BindParams }
}
