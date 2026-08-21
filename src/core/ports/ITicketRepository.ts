import { Ticket } from "../domain/entities/Ticket";

export interface ITicketRepository {
    save(ticket: Ticket): Promise<void>; 
  // Podrías añadir más a futuro, como:
  // findByUserId(userId: string): Promise<Ticket[]>;
}