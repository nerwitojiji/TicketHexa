// 1. TIPOS
export interface TicketProps{
    id? : string;
    userID: string;
    eventID: string;
    ticketQuantity: number;
    status? : string;
    date? : Date;
}
//2 . la entidad
export class Ticket{
    public readonly id ?: string;
    public userID: string;
    public eventID: string;
    public ticketQuantity: number;
    public status: string;
    public date: Date;
// 3. constructor
constructor(props: TicketProps){
    this.validate(props);


    this.id = props.id || crypto.randomUUID();;
    this.userID= props.userID;
    this.eventID= props.eventID;
    this.ticketQuantity= props.ticketQuantity;
    this.status= props.status || 'pendiente'
    this.date= props.date || new Date();
}
private validate(props: TicketProps){
    if (!props.userID || props.userID.trim() === '') {
        throw new Error("La reserva debe tener un usuario asignado");
    }
    if (!props.eventID || props.eventID.trim() === '') {
        throw new Error("La reserva debe tener un evento asignado");
    }
    if(props.ticketQuantity <= 0){
        throw new Error("Debe reservar al menos 1 ticket");
    }
}
}