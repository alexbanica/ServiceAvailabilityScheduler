export class Reservation {
  constructor(
    public readonly id: number | null,
    public readonly serviceKey: string,
    public readonly environmentName: string,
    public readonly serviceName: string,
    public readonly userId: number,
    public readonly claimedAt: string | Date,
    public readonly expiresAt: string | Date,
    public readonly releasedAt: string | Date | null,
  ) {}
}
