import { Venue } from "../../domain/entities/Venue";
// Importar el puerto o contrato del repositorio (para poder usar save del contrato y guardar en bd).
import { IVenueRepository } from "../../ports/IVenueRepository";

export interface CreateVenueDTO{
    name: string;
    address: string;
    standardCapacity: number;
}

export class CreateVenueUseCase{
    // Repositorio debe cumplir contrato IVenueRepository.
    constructor(private readonly venueRepository: IVenueRepository){}

    // Método principal
    async execute(data: CreateVenueDTO): Promise<Venue>{

        // 1. CREAR INSTANCIA VENUE
        const newVenue = new Venue({
            id: crypto.randomUUID(),
            name : data.name,
            address : data.address,
            standardCapacity : data.standardCapacity
        }); 

        // 2. Guardar EN DB
        await this.venueRepository.save(newVenue);

        // 3. RETORNAR EL RESULTADO
        return (newVenue);
    }
}













// import { Event } from '../../domain/entities/Event';
// import { IEventRepository } from '../../ports/IEventRepository';

// //DTO(DATA TRANSFER OBJECT): lo que esperamos recibir de la API
// export interface CreateEventDTO{
//     name: string;
//     date: Date;
//     capacity: number;
//     cost: number;
//     venueId: string;
// }

