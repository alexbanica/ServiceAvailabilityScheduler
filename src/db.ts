import mysql, { Pool, RowDataPacket } from 'mysql2/promise';

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
  await ensureSchema(db);
  await seedUsers(db);
  return db;
}

async function ensureSchema(db: Pool): Promise<void> {
  await db.query(
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      nickname VARCHAR(120) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,
  );

  await db.query(
    `CREATE TABLE IF NOT EXISTS reservations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      service_key VARCHAR(255) NOT NULL,
      environment_name VARCHAR(120) NOT NULL,
      service_name VARCHAR(255) NOT NULL,
      user_id INT NOT NULL,
      claimed_by_label VARCHAR(255) NULL,
      claimed_by_team TINYINT(1) NOT NULL DEFAULT 0,
      claimed_at DATETIME NOT NULL,
      expires_at DATETIME NOT NULL,
      released_at DATETIME NULL,
      CONSTRAINT fk_reservations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB;`,
  );

  await ensureIndex(
    db,
    'reservations',
    'idx_reservations_service_key',
    'service_key',
  );
  await ensureIndex(db, 'reservations', 'idx_reservations_user_id', 'user_id');
}

async function ensureIndex(
  db: Pool,
  tableName: string,
  indexName: string,
  columns: string,
): Promise<void> {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 1
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName],
  );
  if (!rows.length) {
    await db.query(
      `CREATE INDEX ${indexName} ON ${tableName}(${columns})`,
    );
  }
}

async function seedUsers(db: Pool): Promise<void> {
  const raw = process.env.SEED_USERS;
  if (!raw) {
    return;
  }
  const entries = parseSeedUsers(raw);
  if (!entries.length) {
    return;
  }
  for (const entry of entries) {
    await db.query(
      `INSERT INTO users (email, nickname)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
      [entry.email, entry.nickname],
    );
  }
}

function parseSeedUsers(value: string): Array<{ email: string; nickname: string }> {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex <= 0 || separatorIndex === entry.length - 1) {
        console.warn(
          `Skipping SEED_USERS entry "${entry}". Expected "email:nickname".`,
        );
        return [];
      }
      const email = entry.slice(0, separatorIndex).trim();
      const nickname = entry.slice(separatorIndex + 1).trim();
      if (!email || !nickname) {
        console.warn(
          `Skipping SEED_USERS entry "${entry}". Expected "email:nickname".`,
        );
        return [];
      }
      return [{ email, nickname }];
    });
}
