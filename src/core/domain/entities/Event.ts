import { error } from "console";

//1. TIPOS:
export interface EventProps {
    id ?: string;
    name: string;
    date: Date;
    capacity: number;
    cost: number;
    venueId: string;
}

    //2. LA ENTIDAD:
export class Event {
    public readonly id?: string;
    public name: string;
    public date: Date;
    public cost: number;
    public capacity: number;
    public venueId: string;

    //3. CONSTRUCTOR:
    constructor(props: EventProps) {
        this.validate(props);

        this.id = props.id;
        this.name = props.name;
        this.date = props.date;
        this.capacity = props.capacity;
        this.cost = props.cost;
        this.venueId = props.venueId;
    }
    private validate(props: EventProps) {
      if (!props.name || props.name.length < 3 ){
        throw new Error("el nombre debe contener mas de 3 caracteres");
      }
    if (!props.name || props.name.trim() === '') {
      throw new Error("El nombre del evento no puede estar vacío.");
    }
    if (props.capacity <= 0) {
      throw new Error("La capacidad máxima debe ser mayor a 0.");
    }
    const now = new Date();
    if (props.date < now) {
      throw new Error("No puedes programar un evento en una fecha pasada.");
    }
    if (props.cost <= 0) {
      throw new Error("El costo del evento debe ser mayor a 0.");
    }
    if (props.venueId && props.venueId.trim() === '') {
      throw new Error("El ID del lugar no puede estar vacío.");
    }
  }
}