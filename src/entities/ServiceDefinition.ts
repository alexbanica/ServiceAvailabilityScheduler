export class ServiceDefinition {
  constructor(
    public readonly key: string,
    public readonly environment: string,
    public readonly id: string,
    public readonly label: string,
    public readonly defaultMinutes: number,
  ) {}
}
