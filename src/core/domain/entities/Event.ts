import { error } from "console";

//1. TIPOS:
export interface EventProps {
    id : string;
    name: string;
    date: Date;
    capacity: number;
    cost: number;
    venueId: string;
}

    //2. LA ENTIDAD:
export class Event {
    public readonly id: string;
    public name: string;
    public date: Date;
    public cost: number;
    public capacity: number;
    public venueId: string;

    //3. CONSTRUCTOR:
    private constructor(props: EventProps) {
        this.validate(props);

        this.id = props.id;
        this.name = props.name;
        this.date = props.date;
        this.capacity = props.capacity;
        this.cost = props.cost;
        this.venueId = props.venueId;
    }
    //4. 2 Puertas para validacion de eventos
    //PUERTA A: VALIDA UN EVENTO QUE SE ESTA CREANDO 
    static create(props: EventProps): Event {
      Event.validateCreationRules(props);
      return new Event(props);
    }
    //PUERTA B: SE SALTA LA VALIDACION , PARA TRABAJAR CON UN EVENTO QUE YA HA SIDO CREADO
    static reconstitute(props:EventProps): Event{
      return new Event(props);
    }
    //5. Metodo para vender Tickets
    public SellTicket(cantidad: number):void {
      if (this.capacity < cantidad){
        throw new Error("Capacidad insuficiente");
      }
      this.capacity= this.capacity - cantidad;
    }
    private validate(props: EventProps) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error("El nombre del evento no puede estar vacío y debe ser mayor a 3 caracteres");
    }
    if (props.capacity <= 0) {
      throw new Error("La capacidad máxima debe ser mayor a 0.");
    }
    if (props.cost <= 0) {
      throw new Error("El costo del evento debe ser mayor a 0.");
    }
    if (props.venueId && props.venueId.trim() === '') {
      throw new Error("El ID del lugar no puede estar vacío.");
    }
  }
  private static validateCreationRules(props: EventProps) {
    const now= new(Date);
    if (props.date < now) {
      throw new Error("La fecha del evento no puede ser anterior a la fecha actual.");
    }
  }
}