// src/infrastructure/repositories/DrizzleEventRepository.ts

// 1. Importamos el dominio y el puerto (El Jefe y el Contrato)
import { eq } from 'drizzle-orm';
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
      cost: event.cost, 
      venueId: event.venueId, 
    });
  }

  async findById(id: string): Promise<Event | null> {
    // Aquí iría el código Drizzle para buscar (SELECT * FROM events WHERE id = ?)
    const result = await db.select().from(eventsTable).where(eq(eventsTable.id,id));

    if(result.length == 0){
      return null;
    }

    const FoundRes= result[0];

    const event= new Event({
      id: FoundRes.id, 
      name: FoundRes.name,
      date: FoundRes.date,
      capacity: FoundRes.capacity,
      cost: FoundRes.cost, 
      venueId: FoundRes.venueId, 
    });

    return event;
  }

  async findAll(): Promise<Event[]> {
    const result = await db.select().from(eventsTable);

    return result.map(row => new Event({
      id: row.id,
      name: row.name,
      date: row.date,
      capacity: row.capacity,
      cost: row.cost,
      venueId: row.venueId
    }));
  }
}