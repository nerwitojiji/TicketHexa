import {Event} from "../domain/entities/Event";
export interface IEventRepository {
    // Guarda un evento nuevo o actualiza uno existente
    save(event: Event): Promise<void>;

    // Busca un evento por su ID
    findById(id: string): Promise<Event | null>;
    // Trae todos los eventos 
    findAll(): Promise<Event[]>;

    update(event: Event): Promise<void>;
}