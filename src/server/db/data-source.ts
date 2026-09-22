import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  User,
  Radiobase,
  Reporte,
  EvidenciaFotografica,
  ZonaMatriz,
  EquipoInstalado,
} from '../entities';

declare global {
  // eslint-disable-next-line no-var
  var __TYPEORM_DATA_SOURCE__: DataSource | undefined;
}

export function createDataSource(): DataSource {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return new DataSource({
      type: 'postgres',
      url: databaseUrl,
      entities: [User, Radiobase, Reporte, EvidenciaFotografica, ZonaMatriz, EquipoInstalado],
      synchronize: !isProduction, // In production use migrations
      logging: process.env.DB_LOGGING === 'true',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      },
    });
  }

  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sisbirceca_db',
    entities: [User, Radiobase, Reporte, EvidenciaFotografica, ZonaMatriz, EquipoInstalado],
    synchronize: !isProduction,
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  });
}

export async function getDataSource(): Promise<DataSource> {
  if (globalThis.__TYPEORM_DATA_SOURCE__ && globalThis.__TYPEORM_DATA_SOURCE__.isInitialized) {
    return globalThis.__TYPEORM_DATA_SOURCE__;
  }

  const ds = createDataSource();
  await ds.initialize();
  globalThis.__TYPEORM_DATA_SOURCE__ = ds;
  return ds;
}

export const AppDataSource = createDataSource();
