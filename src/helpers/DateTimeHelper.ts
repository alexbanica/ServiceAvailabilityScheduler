export class DateTimeHelper {
  static toMysqlDateTime(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return (
      `${date.getUTCFullYear()}-` +
      `${pad(date.getUTCMonth() + 1)}-` +
      `${pad(date.getUTCDate())} ` +
      `${pad(date.getUTCHours())}:` +
      `${pad(date.getUTCMinutes())}:` +
      `${pad(date.getUTCSeconds())}`
    );
  }

  static mysqlDateTimeToIso(value: string | Date | null): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value !== 'string') {
      return new Date(value).toISOString();
    }
    return `${value.replace(' ', 'T')}Z`;
  }

  static mysqlDateTimeToDate(value: string | Date | null): Date | null {
    const iso = DateTimeHelper.mysqlDateTimeToIso(value);
    return iso ? new Date(iso) : null;
  }
}
