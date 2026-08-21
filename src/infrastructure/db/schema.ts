// src/infrastructure/db/schema.ts
import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

// ==========================================
// 1. USUARIOS (Users)
// ==========================================
export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }), 
  role: varchar('role', { length: 50 }).notNull().default('cliente'),
});

// ==========================================
// 2. LUGARES (Venues) -> ¡Nuestra 3ra Forma Normal!
// ==========================================
export const venuesTable = pgTable('venues', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  standardCapacity: integer('standard_capacity').notNull(), // Capacidad física del recinto
});

// ==========================================
// 3. EVENTOS (Events)
// ==========================================
export const eventsTable = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  // Aforo de ESTE evento. Puede ser menor al del recinto (por si cierran galerías).
  // No cambia nunca: en el dominio es readonly.
  totalCapacity: integer('total_capacity').notNull(),
  // Cuántos lugares quedan por vender. Baja con cada venta; 0 = agotado.
  availableSeats: integer('available_seats').notNull(),
  cost: integer('cost').notNull(),

  // --- FOREIGN KEYS (Las líneas de tu diagrama) ---
  creatorId: uuid('creator_id').references(() => usersTable.id), // Quién lo organizó
  venueId: uuid('venue_id').notNull().references(() => venuesTable.id), // Dónde es
});

// ==========================================
// 4. RESERVAS (Orders) -> La tabla que rompió la relación N:N
// ==========================================
export const ordersTable = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // --- FOREIGN KEYS ---
  userId: uuid('user_id').notNull().references(() => usersTable.id),
  eventId: uuid('event_id').notNull().references(() => eventsTable.id),
  
  // --- DATOS DE LA TRANSACCIÓN ---
  ticketQuantity: integer('ticket_quantity').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pendiente'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tipos inferidos opcionales (muy útiles para TypeScript)
export type EventRecord = typeof eventsTable.$inferSelect;
export type NewEventRecord = typeof eventsTable.$inferInsert;
