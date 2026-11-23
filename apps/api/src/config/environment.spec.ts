import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment.js';

function validEnvironment(): Record<string, unknown> {
  return {
    POSTGRES_PORT: '5434',
    POSTGRES_USER: 'test',
    POSTGRES_PASSWORD: randomUUID(),
    POSTGRES_DB: 'test',
  };
}

describe('Environment validation', () => {
  it('applies defaults and converts ports to numbers', () => {
    const result = validateEnvironment(validEnvironment());

    expect(result.PORT).toBe(3000);
    expect(result.POSTGRES_HOST).toBe('127.0.0.1');
    expect(result.POSTGRES_PORT).toBe(5434);
  });

  it('accepts explicit API port and database host', () => {
    const result = validateEnvironment({
      ...validEnvironment(),
      PORT: '4000',
      POSTGRES_HOST: 'postgres',
    });

    expect(result.PORT).toBe(4000);
    expect(result.POSTGRES_HOST).toBe('postgres');
  });

  it.each(['PORT', 'POSTGRES_PORT'])('rejects invalid values for %s', (key) => {
    for (const value of ['', 'abc', '0', '-1', '65536', '5434.5']) {
      expect(() =>
        validateEnvironment({
          ...validEnvironment(),
          [key]: value,
        }),
      ).toThrow(key);
    }
  });

  it.each([
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ])('rejects missing %s', (key) => {
    const values = validEnvironment();
    delete values[key];

    expect(() => validateEnvironment(values)).toThrow(key);
  });

  it('rejects a blank password without exposing its value', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment(),
        POSTGRES_PASSWORD: '   ',
      }),
    ).toThrow('POSTGRES_PASSWORD must be configured');
  });
});
