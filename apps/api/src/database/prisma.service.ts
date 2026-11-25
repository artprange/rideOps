import { Inject, Injectable } from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Environment } from '../config/environment.js';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(
    @Inject(ConfigService)
    config: ConfigService<Environment>,
  ) {
    const adapter = new PrismaPg({
      host: config.getOrThrow('POSTGRES_HOST', { infer: true }),
      port: config.getOrThrow('POSTGRES_PORT', { infer: true }),
      user: config.getOrThrow('POSTGRES_USER', { infer: true }),
      password: config.getOrThrow('POSTGRES_PASSWORD', { infer: true }),
      database: config.getOrThrow('POSTGRES_DB', { infer: true }),
      max: 5,
      connectionTimeoutMillis: 2000,
    });

    super({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
