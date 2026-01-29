import mysql, { Pool } from 'mysql2/promise';

interface DbConfig {
  uri: string;
  dateStrings: boolean;
  timezone: string;
}

function getConnectionConfig(): DbConfig {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return {
    uri: url,
    dateStrings: true,
    timezone: 'Z',
  };
}

export async function initDb(): Promise<Pool> {
  const db = await mysql.createPool(getConnectionConfig());
  await db.query('SELECT 1');
  return db;
}
