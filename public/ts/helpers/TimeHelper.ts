export class TimeHelper {
  static formatTime(value: string | null): string {
    if (!value) {
      return 'unknown';
    }
    return new Date(value).toLocaleTimeString();
  }
}
