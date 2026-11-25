import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from '../src/auth/auth.controller.js';
import { AuthService } from '../src/auth/auth.service.js';
import { PasswordService } from '../src/auth/password.service.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { Prisma } from '../src/generated/prisma/client.js';

type RegisteredUser = {
  id: string;
  email: string;
  timezone: string;
  createdAt: Date;
};

describe('POST /auth/register', () => {
  let app: INestApplication<App>;
  let input: {
    email: string;
    password: string;
    timezone: string;
  };
  let user: RegisteredUser;

  const create =
    vi.fn<(args: Prisma.UserCreateArgs) => Promise<RegisteredUser>>();

  beforeEach(async () => {
    create.mockReset();

    input = {
      email: `${randomUUID()}@example.com`,
      password: randomUUID(),
      timezone: 'America/Sao_Paulo',
    };

    user = {
      id: randomUUID(),
      email: input.email,
      timezone: input.timezone,
      createdAt: new Date(),
    };

    create.mockResolvedValue(user);

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        PasswordService,
        {
          provide: PrismaService,
          useValue: { user: { create } },
        },
      ],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 201, normalizes email, and excludes credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...input,
        email: `  ${input.email.toUpperCase()}  `,
      })
      .expect(201);

    expect(response.body).toEqual({
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt.toISOString(),
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0]![0].data.email).toBe(input.email);
  });

  it('returns 409 when the email already exists', async () => {
    create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client,
        meta: { target: ['email'] },
      }),
    );

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(input)
      .expect(409);
  });

  it.each([
    ['invalid email', { email: 'invalid' }],
    ['short password', { password: randomUUID().slice(0, 8) }],
    ['invalid timezone', { timezone: 'Not/A_Timezone' }],
    ['unexpected field', { role: 'admin' }],
  ])('returns 400 for %s before accessing the database', async (_, changes) => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...input, ...changes })
      .expect(400);

    expect(create).not.toHaveBeenCalled();
  });

  it('returns 400 when required fields are missing', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);

    expect(create).not.toHaveBeenCalled();
  });
});
