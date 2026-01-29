import { AppConfigDto } from '../dtos/AppConfigDto';
import { ServiceDefinition } from '../entities/ServiceDefinition';

export class ServiceCatalogService {
  buildServiceList(config: AppConfigDto): ServiceDefinition[] {
    const services: ServiceDefinition[] = [];
    config.environments.forEach((env) => {
      env.services.forEach((svc) => {
        services.push(
          new ServiceDefinition(
            `${env.name}:${svc.id}`,
            env.name,
            svc.id,
            svc.label || svc.id,
            svc.defaultMinutes,
          ),
        );
      });
    });
    return services;
  }
}
