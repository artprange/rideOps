import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { Environment } from '../config/environment.js';

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);
  private readonly pool: Pool;

  constructor(
    @Inject(ConfigService)
    config: ConfigService<Environment>,
  ) {
    this.pool = new Pool({
      host: config.getOrThrow('POSTGRES_HOST', { infer: true }),
      port: config.getOrThrow('POSTGRES_PORT', { infer: true }),
      user: config.getOrThrow('POSTGRES_USER', { infer: true }),
      password: config.getOrThrow('POSTGRES_PASSWORD', { infer: true }),
      database: config.getOrThrow('POSTGRES_DB', { infer: true }),
      max: 2,
      connectionTimeoutMillis: 2000,
      query_timeout: 2000,
      statement_timeout: 2000,
    });

    this.pool.on('error', () => {
      this.logger.warn('An idle database connection failed');
    });
  }

  async ready(): Promise<{ status: 'ok' }> {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'unavailable',
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
