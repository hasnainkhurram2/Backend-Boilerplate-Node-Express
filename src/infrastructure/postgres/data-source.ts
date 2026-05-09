import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '@/config';

/**
 * TypeORM DataSource for PostgreSQL.
 * Only initializes when POSTGRES_HOST is provided.
 * Add your entities to the `entities` array as you build modules.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.POSTGRES_HOST ?? 'localhost',
  port: env.POSTGRES_PORT,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  synchronize: env.NODE_ENV === 'development', // use migrations in production
  logging: env.NODE_ENV === 'development',
  entities: [__dirname + '/../../modules/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});

export async function connectPostgres(): Promise<void> {
  if (!env.POSTGRES_HOST) {
    return;
  }
  if (AppDataSource.isInitialized) {
    return;
  }
  await AppDataSource.initialize();
}

export async function disconnectPostgres(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}
