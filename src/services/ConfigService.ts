import {
  AppConfigDto,
  EnvironmentConfigDto,
  ServiceConfigDto,
} from '../dtos/AppConfigDto';

export class ConfigService {
  constructor(private readonly rawConfig: Record<string, unknown>) {}

  toDto(): AppConfigDto {
    const expiryWarningMinutes = Number(
      this.rawConfig.expiry_warning_minutes ?? 5,
    );
    const autoRefreshMinutes = Number(this.rawConfig.auto_refresh_minutes ?? 2);
    const envs = Array.isArray(this.rawConfig.environments)
      ? (this.rawConfig.environments as Array<Record<string, unknown>>)
      : [];

    const environments = envs.map((env) => {
      const envName = typeof env.name === 'string' ? env.name : 'Unknown';
      const servicesRaw = Array.isArray(env.services)
        ? (env.services as Array<Record<string, unknown>>)
        : [];
      const services = servicesRaw.map((svc: Record<string, unknown>) => {
        const id = typeof svc.id === 'string' ? svc.id : 'unknown';
        const label = typeof svc.label === 'string' ? svc.label : null;
        const defaultMinutes = Number(svc.default_minutes ?? 30);
        return new ServiceConfigDto(id, label, defaultMinutes);
      });
      return new EnvironmentConfigDto(envName, services);
    });

    return new AppConfigDto(
      expiryWarningMinutes,
      autoRefreshMinutes,
      environments,
    );
  }
}
