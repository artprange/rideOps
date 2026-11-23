import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Environment } from '../config/environment.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

const database = vi.hoisted(() => ({
  query: vi.fn<() => Promise<unknown>>(),
  end: vi.fn<() => Promise<void>>(),
}));

vi.mock('pg', () => ({
  Pool: class {
    query = database.query;
    end = database.end;
    on = vi.fn();
  },
}));

describe('Health endpoints', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    database.query.mockReset().mockResolvedValue({ rows: [] });
    database.end.mockReset().mockResolvedValue(undefined);

    const environment: Environment = {
      PORT: 3000,
      POSTGRES_HOST: '127.0.0.1',
      POSTGRES_PORT: 5434,
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: randomUUID(),
      POSTGRES_DB: 'test',
    };

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: new ConfigService<Environment>(environment),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    expect(database.end).toHaveBeenCalledOnce();
  });

  it('reports readiness after a successful database query', async () => {
    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({ status: 'ok' });

    expect(database.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns a sanitized 503 when the database fails', async () => {
    database.query.mockRejectedValueOnce(
      new Error('Internal database connection details'),
    );

    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(503)
      .expect({ status: 'unavailable' });
  });

  it('reports liveness without querying the database', async () => {
    database.query.mockRejectedValue(new Error('Database unavailable'));

    await request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect({ status: 'ok' });

    expect(database.query).not.toHaveBeenCalled();
  });

  it('recovers readiness without restarting the API', async () => {
    database.query
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockResolvedValueOnce({ rows: [] });

    await request(app.getHttpServer()).get('/health/ready').expect(503);

    await request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
