// 1. IMPORTACIONES
// Importamos entidad Venue para usarla como tipo en repositorio
import {Venue} from "../domain/entities/Venue";

export interface IVenueRepository {
    // Metodo guarda o actualiza venue
    save(venue: Venue): Promise<void>;

    // Metodo busca venue por su ID 
    findById(id: string): Promise<Venue | null>;
    
    // Metodo trae todos los venues
    findAll(): Promise<Venue[]>;
}
