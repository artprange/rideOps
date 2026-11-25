import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PasswordService } from './password.service.js';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('accepts the correct password', async () => {
    const password = randomUUID();
    const passwordHash = await service.hash(password);

    expect(passwordHash).not.toBe(password);
    expect(passwordHash).toMatch(/^\$argon2id\$/);

    await expect(service.verify(passwordHash, password)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const passwordHash = await service.hash(randomUUID());

    await expect(service.verify(passwordHash, randomUUID())).resolves.toBe(
      false,
    );
  });

  it('generates different hashes for the same password', async () => {
    const password = randomUUID();
    const firstHash = await service.hash(password);
    const secondHash = await service.hash(password);

    expect(firstHash).not.toBe(secondHash);

    await expect(service.verify(firstHash, password)).resolves.toBe(true);
    await expect(service.verify(secondHash, password)).resolves.toBe(true);
  });
});
