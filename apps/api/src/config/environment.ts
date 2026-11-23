export interface Environment {
  PORT: number;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
}

function required(values: Record<string, unknown>, key: string): string {
  const value = values[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} must be configured`);
  }

  return value;
}

function port(value: unknown, key: string): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new Error(`${key} must be an integer port`);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`${key} must be between 1 and 65535`);
  }

  return parsed;
}

export function validateEnvironment(
  values: Record<string, unknown>,
): Environment {
  return {
    PORT: port(values.PORT ?? '3000', 'PORT'),
    POSTGRES_HOST: required(
      { POSTGRES_HOST: '127.0.0.1', ...values },
      'POSTGRES_HOST',
    ),
    POSTGRES_PORT: port(values.POSTGRES_PORT, 'POSTGRES_PORT'),
    POSTGRES_USER: required(values, 'POSTGRES_USER'),
    POSTGRES_PASSWORD: required(values, 'POSTGRES_PASSWORD'),
    POSTGRES_DB: required(values, 'POSTGRES_DB'),
  };
}
