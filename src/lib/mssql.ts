import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_SERVER || 'sql6034.site4now.net',
  database: process.env.DB_NAME || 'db_acfddc_tracker',
  user: process.env.DB_USER || 'db_acfddc_tracker_admin',
  password: process.env.DB_PASSWORD || '@Mehdy1377',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Global pool caching for Next.js hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __mssqlPool: sql.ConnectionPool | undefined;
}

export async function getSqlPool(): Promise<sql.ConnectionPool> {
  if (globalThis.__mssqlPool && globalThis.__mssqlPool.connected) {
    return globalThis.__mssqlPool;
  }

  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  globalThis.__mssqlPool = pool;
  return pool;
}

export const isSqlConfigured = Boolean(process.env.DB_SERVER);
