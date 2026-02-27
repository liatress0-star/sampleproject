import oracledb from "oracledb";

// Oracle Thin 모드 (Instant Client 불필요)
// 환경변수 설정: .env.local
//   ORACLE_USER=your_user
//   ORACLE_PASSWORD=your_password
//   ORACLE_CONNECTION_STRING=host:port/service_name

let poolPromise: Promise<oracledb.Pool> | null = null;

function getPoolConfig(): oracledb.PoolAttributes {
  return {
    user: process.env.ORACLE_USER || "",
    password: process.env.ORACLE_PASSWORD || "",
    connectString: process.env.ORACLE_CONNECTION_STRING || "localhost:1521/XEPDB1",
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  };
}

function initPool(): Promise<oracledb.Pool> {
  if (!poolPromise) {
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;
    oracledb.fetchAsString = [oracledb.CLOB];

    poolPromise = oracledb.createPool(getPoolConfig());
  }
  return poolPromise;
}

export async function getConnection(): Promise<oracledb.Connection> {
  const pool = await initPool();
  return pool.getConnection();
}

/**
 * SQL 실행 헬퍼 - SELECT 쿼리
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  binds: oracledb.BindParameters = {},
): Promise<T[]> {
  let conn: oracledb.Connection | undefined;
  try {
    conn = await getConnection();
    const result = await conn.execute<T>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return (result.rows as T[]) || [];
  } finally {
    if (conn) await conn.close();
  }
}

/**
 * SQL 실행 헬퍼 - INSERT/UPDATE/DELETE
 */
export async function execute(
  sql: string,
  binds: oracledb.BindParameters = {},
  options: oracledb.ExecuteOptions = {},
): Promise<oracledb.Result<unknown>> {
  let conn: oracledb.Connection | undefined;
  try {
    conn = await getConnection();
    const result = await conn.execute(sql, binds, {
      autoCommit: true,
      ...options,
    });
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

/**
 * INSERT 후 생성된 ID 반환
 */
export async function insertReturningId(
  sql: string,
  binds: oracledb.BindParameters = {},
): Promise<number> {
  let conn: oracledb.Connection | undefined;
  try {
    conn = await getConnection();
    const result = await conn.execute(sql, binds, { autoCommit: true });
    // RETURNING ... INTO :id 바인드에서 ID 추출
    const outBinds = result.outBinds as Record<string, number[]> | undefined;
    if (outBinds && outBinds.id) {
      return outBinds.id[0];
    }
    return 0;
  } finally {
    if (conn) await conn.close();
  }
}
