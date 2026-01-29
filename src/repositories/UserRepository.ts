import type { Pool, RowDataPacket } from 'mysql2/promise';
import { User } from '../entities/User';
import { AbstractMysqlRepository } from './AbstractMysqlRepository';

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  nickname: string;
};

export class UserRepository extends AbstractMysqlRepository {
  constructor(db: Pool) {
    super(db);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.get<UserRow>(
      'SELECT id, email, nickname FROM users WHERE email = ?',
      [email],
    );
    if (!row) {
      return null;
    }
    return new User(row.id, row.email, row.nickname);
  }

  async findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) {
      return [];
    }
    const placeholders = ids.map(() => '?').join(',');
    const rows = await this.all<UserRow>(
      `SELECT id, email, nickname FROM users WHERE id IN (${placeholders})`,
      ids,
    );
    return rows.map((row) => new User(row.id, row.email, row.nickname));
  }
}
