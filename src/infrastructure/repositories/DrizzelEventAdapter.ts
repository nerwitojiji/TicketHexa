// src/infrastructure/repositories/DrizzleEventRepository.ts

// 1. Importamos el dominio y el puerto (El Jefe y el Contrato)
import { Event } from '../../core/domain/entities/Event';
import { IEventRepository } from '../../core/ports/IEventRepository';

// 2. Importamos la infraestructura (Las herramientas del trabajador)
import { db } from '../db'; // Asumiendo que aquí tienes tu conexión a la base de datos
import { eventsTable } from '../db/schema';

// 3. EL ADAPTADOR FIRMA EL CONTRATO (implements IEventRepository)
export class DrizzleEventRepository implements IEventRepository {
  
  // Como firmó el contrato, está OBLIGADO a tener el método save()
  async save(event: Event): Promise<void> {
    // Aquí el adaptador "traduce" del mundo puro (Event) al mundo SQL (Drizzle)
    await db.insert(eventsTable).values({
      // Si el evento ya tiene ID, lo usamos. Si no, Drizzle o Postgres generarán uno.
      id: event.id, 
      name: event.name,
      date: event.date,
      capacity: event.capacity,
      // NOTA: Para que esto coincida exacto con tu schema, tendríamos que 
      // actualizar tu entidad Event.ts para que acepte 'cost' y 'venueId'.
      cost: event.cost, 
      venueId: event.venueId, 
    });
  }

  async findById(id: string): Promise<Event | null> {
    // Aquí iría el código Drizzle para buscar (SELECT * FROM events WHERE id = ?)
    throw new Error("Método no implementado todavía");
  }

  async findAll(): Promise<Event[]> {
    // Aquí iría el código Drizzle para traer todos
    throw new Error("Método no implementado todavía");
  }
}