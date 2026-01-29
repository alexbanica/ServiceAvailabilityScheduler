import { ApiService } from './ApiService.js';

export class LoginService {
  static async login(email: string): Promise<void> {
    const response = await ApiService.post('/api/login', { email });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error || 'Login failed.');
    }
  }
}
