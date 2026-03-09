// src/infrastructure/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // <-- 1. Importamos tus tablas

// 2. Creamos la conexión segura usando el cliente de Neon
const sql = neon(process.env.DATABASE_URL!);

// 3. Inicializamos Drizzle y le inyectamos el schema
export const db = drizzle(sql, { schema });