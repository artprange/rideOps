import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';

type RegisteredUser = {
  id: string;
  email: string;
  timezone: string;
  createdAt: Date;
};

describe('AuthService registration', () => {
  let module: TestingModule;
  let service: AuthService;
  let passwords: PasswordService;

  const create =
    vi.fn<(args: Prisma.UserCreateArgs) => Promise<RegisteredUser>>();

  function registrationInput() {
    return {
      email: `${randomUUID()}@example.com`,
      password: randomUUID(),
      timezone: 'America/Sao_Paulo',
    };
  }

  beforeEach(async () => {
    create.mockReset();

    module = await Test.createTestingModule({
      providers: [
        AuthService,
        PasswordService,
        {
          provide: PrismaService,
          useValue: { user: { create } },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    passwords = module.get(PasswordService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('hashes the password and requests only safe account fields', async () => {
    const input = registrationInput();

    const user: RegisteredUser = {
      id: randomUUID(),
      email: input.email,
      timezone: input.timezone,
      createdAt: new Date(),
    };

    create.mockResolvedValueOnce(user);

    const result = await service.register(input);

    expect(create).toHaveBeenCalledTimes(1);

    const args = create.mock.calls[0]![0];

    expect(args.data.email).toBe(input.email);
    expect(args.data.timezone).toBe(input.timezone);
    expect(args.data).not.toHaveProperty('password');
    expect(args.data.passwordHash).not.toBe(input.password);

    await expect(
      passwords.verify(args.data.passwordHash, input.password),
    ).resolves.toBe(true);

    expect(args.select).toEqual({
      id: true,
      email: true,
      timezone: true,
      createdAt: true,
    });

    expect(result).toEqual(user);
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('turns a unique constraint violation into a conflict', async () => {
    create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: Prisma.prismaVersion.client,
        meta: { target: ['email'] },
      }),
    );

    await expect(service.register(registrationInput())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('does not disguise unrelated database failures as conflicts', async () => {
    const failure = new Error('Database unavailable');
    create.mockRejectedValueOnce(failure);

    await expect(service.register(registrationInput())).rejects.toBe(failure);
  });
});
