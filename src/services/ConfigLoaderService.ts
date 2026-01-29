import fs from 'fs';
import yaml from 'js-yaml';
import { ConfigService } from './ConfigService';
import { AppConfigDto } from '../dtos/AppConfigDto';

export class ConfigLoaderService {
  loadConfig(configPath: string): AppConfigDto {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(raw) as Record<string, unknown>;
    return new ConfigService(parsed || {}).toDto();
  }
}
