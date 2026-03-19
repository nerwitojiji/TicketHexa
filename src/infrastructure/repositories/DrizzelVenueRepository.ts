// src/infrastructure/repositories/DrizzleVenueRepository.ts

// 1. IMPORTAR DOMINIO Y PURTO
import { eq } from 'drizzle-orm';
import { Venue } from '../../core/domain/entities/Venue';
import { IVenueRepository } from '../../core/ports/IVenueRepository';

// 2. IMPORTAR INFRAESTRUCTURA 
import { db } from '../db'; // Asumiendo que aquí tienes tu conexión a la base de datos
import { eventsTable, venuesTable } from '../db/schema';

// 3. IMPLMNTACION CONTRATO:
// Metodos save, findById y findAll -> Va aqui ya que se hace por medio de drizzle
export class DrizzleVenueRepository implements IVenueRepository{

    // Método save
    async save(venue: Venue): Promise<void>{
        // Guarda o actualiza venue
        await db.insert(venuesTable).values({
            id: venue.id, 
            name: venue.name,
            address: venue.address,
            standardCapacity: venue.standardCapacity
        });
      }


    // Método findByID
    async findById(id: string): Promise<Venue | null> {
        // 1. Buscar venue por ID en DB
        const result = await db.select().from(venuesTable).where(eq(venuesTable.id,id));
        
        // 2. Si no existe retornar nulo  
        if(result.length == 0){
        return null;
        }

        // 3. Extraer respuesta de lista de resultados
        const FoundRes = result[0];

        // 4. Crear instancia Venue con resultado encontrado en DB
        const venue = new Venue({
            id: FoundRes.id, 
            name: FoundRes.name,
            address: FoundRes.address,
            standardCapacity: FoundRes.standardCapacity
        });

        // 5. Retorna instancia Venue
        return venue;
    }


    // Método findAll
    async findAll(): Promise<Venue[]> {
        // 1. Extraer todas las venue del DB
        const result = await db.select().from(venuesTable);

        //2. Crear lista con instancias Venue para cada venue encontrarda en result
        const listVenues = result.map(row => new Venue({
            id: row.id, 
            name: row.name,
            address: row.address,
            standardCapacity: row.standardCapacity
        }));

        return listVenues
    }
}