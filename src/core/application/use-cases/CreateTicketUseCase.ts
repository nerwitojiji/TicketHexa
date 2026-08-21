import { Ticket } from "../../domain/entities/Ticket";
import { IEventRepository } from "../../ports/IEventRepository";
import { ITicketRepository } from "../../ports/ITicketRepository";
//DTO LO QUE ESPERAMOS RECIBIR DE LA API
export interface CreateTicketDTO{
    userID: string;
    eventID: string;
    ticketQuantity: number;
}

export class CreateTicketUseCase{
    //inyeccion de dependencias: se pide el contrato al puerto 
    constructor(
        private readonly eventRepository: IEventRepository,
        private readonly ticketRepository: ITicketRepository
    ){}
    public async execute(data : CreateTicketDTO): Promise<Ticket>{
        const event =await this.eventRepository.findById(data.eventID);
        if (!event){
            throw new Error("el evento solicitado no existe");
        }
        event.sellTicket(data.ticketQuantity);
        const newTicket= new Ticket({
            userID: data.userID ,
            eventID: data.eventID,
            ticketQuantity: data.ticketQuantity,
        });
        await this.eventRepository.update(event);
        await this.ticketRepository.save(newTicket);
        return (newTicket);
    }
}