import { Event } from '../../domain/entities/Event';
import { IEventRepository } from '../../ports/IEventRepository';

//DTO(DATA TRANSFER OBJECT): lo que esperamos recibir de la API
export interface CreateEventDTO{
    name: string;
    date: Date;
    capacity: number;
    cost: number;
    venueId: string;
}

export class CreateEventUseCase{
    //Inyeccion de dependencias : pedimos el contrato al puerto
    constructor(private readonly eventRepository: IEventRepository){}

    //Metodo principal
    async execute(data: CreateEventDTO): Promise<Event>{
        // 1. INSTANCIAR LA ENTIDAD
        // Crea una constante llamada 'newEvent'.
        // Asígnale una nueva instancia de tu clase Event usando la palabra 'new'.
        // Recuerda que el primer parámetro de Event es el ID. Puedes generar uno usando 'crypto.randomUUID()'
        // Los demás parámetros sácalos del objeto 'data' (data.name, data.date, etc.)
        const newEvent = new Event({
            id: crypto.randomUUID(),
            name: data.name ,
            date: data.date ,
            capacity: data.capacity,
            cost : data.cost,
            venueId: data.venueId 
    });
    // 2. GUARDAR EN LA BASE DE DATOS
    // Usa 'this.eventRepository' para llamar al método que guarda (el que definimos en el contrato).
    // No olvides poner 'await' porque es una operación asíncrona. Pásale 'newEvent' como parámetro.
    await this.eventRepository.save(newEvent);
    // 3. RETORNAR EL RESULTADO
    // Devuelve el 'newEvent' para que la API pueda mostrárselo al usuario
    return (newEvent);

    }
}
