import { Service } from '../entities/Service.js';

export class ServicesResponseDto {
  constructor(
    public readonly expiryWarningMinutes: number,
    public readonly autoRefreshMinutes: number,
    public readonly services: Service[]
  ) {}
}
