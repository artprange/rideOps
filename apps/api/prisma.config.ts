import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { validateEnvironment } from './src/config/environment.js';

config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
  quiet: true,
});

const environment = validateEnvironment(process.env);

const databaseUrl = new URL('postgresql://localhost');

databaseUrl.hostname = environment.POSTGRES_HOST;
databaseUrl.port = String(environment.POSTGRES_PORT);
databaseUrl.username = environment.POSTGRES_USER;
databaseUrl.password = environment.POSTGRES_PASSWORD;
databaseUrl.pathname = `/${encodeURIComponent(environment.POSTGRES_DB)}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl.toString(),
  },
});
