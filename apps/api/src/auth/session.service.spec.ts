import 'reflect-metadata';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service.js';
import { SessionService } from './sessions.service.js';

describe('SessionService', () => {
  let module: TestingModule;
  let service: SessionService;

  const create = vi.fn();
  const findUnique = vi.fn();
  const deleteMany = vi.fn();

  const now = new Date('2026-01-01T12:00:00.000Z');

  function newToken() {
    return randomBytes(32).toString('base64url');
  }

  function hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  function account() {
    return {
      id: randomUUID(),
      email: `${randomUUID()}@example.com`,
      timezone: 'America/Sao_Paulo',
      createdAt: now,
    };
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    create.mockReset();
    findUnique.mockReset();
    deleteMany.mockReset();

    create.mockResolvedValue({ id: randomUUID() });
    deleteMany.mockResolvedValue({ count: 1 });

    module = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: PrismaService,
          useValue: {
            session: { create, findUnique, deleteMany },
          },
        },
      ],
    }).compile();

    service = module.get(SessionService);
  });

  afterEach(async () => {
    try {
      await module.close();
    } finally {
      vi.useRealTimers();
    }
  });

  it('stores only the token hash and sets an eight-hour expiry', async () => {
    const userId = randomUUID();
    const result = await service.create(userId);

    expect(result.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.expiresAt).toEqual(new Date('2026-01-01T20:00:00.000Z'));

    expect(create).toHaveBeenCalledExactlyOnceWith({
      data: {
        userId,
        tokenHash: hashToken(result.token),
        expiresAt: result.expiresAt,
      },
      select: { id: true },
    });
  });

  it('generates a different token for each session', async () => {
    const userId = randomUUID();

    const first = await service.create(userId);
    const second = await service.create(userId);

    expect(first.token).not.toBe(second.token);
  });

  it('returns the user for an unexpired session', async () => {
    const token = newToken();
    const user = account();

    findUnique.mockResolvedValue({
      expiresAt: new Date(now.getTime() + 1),
      user,
    });

    await expect(service.validate(token)).resolves.toEqual(user);

    expect(findUnique).toHaveBeenCalledExactlyOnceWith({
      where: { tokenHash: hashToken(token) },
      select: {
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            timezone: true,
            createdAt: true,
          },
        },
      },
    });
  });

  it.each([0, -1])(
    'rejects a session expiring %i milliseconds from now',
    async (offset) => {
      findUnique.mockResolvedValue({
        expiresAt: new Date(now.getTime() + offset),
        user: account(),
      });

      await expect(service.validate(newToken())).resolves.toBeNull();
    },
  );

  it('rejects an unknown token', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.validate(newToken())).resolves.toBeNull();
  });

  it('rejects malformed tokens without querying the database', async () => {
    await expect(service.validate('invalid')).resolves.toBeNull();

    expect(findUnique).not.toHaveBeenCalled();
  });

  it('revokes a session using its token hash', async () => {
    const token = newToken();

    await service.revoke(token);

    expect(deleteMany).toHaveBeenCalledExactlyOnceWith({
      where: { tokenHash: hashToken(token) },
    });
  });

  it('allows revoking a session that no longer exists', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.revoke(newToken())).resolves.toBeUndefined();
  });

  it('ignores malformed tokens during revocation', async () => {
    await service.revoke('invalid');

    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('propagates database failures during validation', async () => {
    const failure = new Error('Database unavailable');
    findUnique.mockRejectedValue(failure);

    await expect(service.validate(newToken())).rejects.toBe(failure);
  });
});
