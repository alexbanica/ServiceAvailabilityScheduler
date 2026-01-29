export class AppConfigDto {
  constructor(
    public readonly expiryWarningMinutes: number,
    public readonly autoRefreshMinutes: number,
    public readonly environments: EnvironmentConfigDto[],
  ) {}
}

export class EnvironmentConfigDto {
  constructor(
    public readonly name: string,
    public readonly services: ServiceConfigDto[],
  ) {}
}

export class ServiceConfigDto {
  constructor(
    public readonly id: string,
    public readonly label: string | null,
    public readonly defaultMinutes: number,
  ) {}
}
