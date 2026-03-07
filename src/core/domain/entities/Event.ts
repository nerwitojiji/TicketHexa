//1. TIPOS:
export interface EventProps {
    id?: string;
    name: string;
    date: Date;
    capacity: number;
    location: string; }

    //2. LA ENTIDAD:
export class Event {
    public readonly id?: string;
    public name: string;
    public date: Date;
    public capacity: number;
    public location: string;

    //3. CONSTRUCTOR:
    constructor(props: EventProps) {
        this.validate(props);

        this.id = props.id;
        this.name = props.name;
        this.date = props.date;
        this.capacity = props.capacity;
        this.location = props.location;
    }
    private validate(props: EventProps) {
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
  }
}