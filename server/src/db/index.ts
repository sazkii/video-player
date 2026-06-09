import initSqlJs, { type Database } from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '../../data.db')

let db: Database

/** 初始化数据库 */
export async function initDB(): Promise<Database> {
  const SQL = await initSqlJs()

  // 如果数据库文件存在则加载，否则新建
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      poster TEXT,
      year TEXT,
      genre TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      poster TEXT,
      episode_name TEXT,
      episode_url TEXT,
      current_time REAL DEFAULT 0,
      duration REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(site_id, url, episode_url)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      config TEXT
    )
  `)

  saveDB()
  return db
}

/** 保存数据库到文件 */
export function saveDB(): void {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

/** 获取数据库实例 */
export function getDB(): Database {
  if (!db) throw new Error('Database not initialized. Call initDB() first.')
  return db
}

/** 查询多行 */
export function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql)
  stmt.bind(params as initSqlJs.BindParams)
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

/** 查询单行 */
export function queryOne<T>(sql: string, params: unknown[] = []): T | null {
  const stmt = db.prepare(sql)
  stmt.bind(params as initSqlJs.BindParams)
  const row = stmt.step() ? (stmt.getAsObject() as T) : null
  stmt.free()
  return row
}

/** 执行写操作（INSERT/UPDATE/DELETE） */
export function execute(sql: string, params: unknown[] = []): void {
  db.run(sql, params as initSqlJs.BindParams)
  saveDB()
}
