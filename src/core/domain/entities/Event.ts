//1. TIPOS:
export interface EventProps {
  id: string;
  name: string;
  date: Date;
  totalCapacity: number;
  availableSeats: number;
  cost: number;
  venueId: string;
}
export type Evento = Omit<EventProps , 'availableSeats'>;
//2. LA ENTIDAD:
export class Event {
  public readonly id: string;
  public name: string;
  public date: Date;
  public cost: number;
  public readonly totalCapacity: number;
  public availableSeats: number;
  public venueId: string;

  //3. CONSTRUCTOR:
  private constructor(props: EventProps) {
    this.validate(props);

    this.id = props.id;
    this.name = props.name;
    this.date = props.date;
    this.totalCapacity = props.totalCapacity;
    this.availableSeats = props.availableSeats;
    this.cost = props.cost;
    this.venueId = props.venueId;
  }
  //4. 2 Puertas para validacion de eventos
  //PUERTA A: VALIDA UN EVENTO QUE SE ESTA CREANDO
  static create(props: Evento): Event {
    Event.validateCreationRules(props);
    return new Event({
      ...props,
      availableSeats: props.totalCapacity,
    });
  }
  //PUERTA B: SE SALTA LAS REGLAS DE CREACION , PARA TRABAJAR CON UN EVENTO QUE YA HA SIDO CREADO
  static reconstitute(props: EventProps): Event {
    return new Event(props);
  }
  //5. Metodo para vender Tickets
  public sellTicket(cantidad: number): void {
    if (this.availableSeats < cantidad) {
      throw new Error("Capacidad insuficiente");
    }
    this.availableSeats = this.availableSeats - cantidad;
  }
  private validate(props: EventProps) {
    if (!props.name || props.name.trim().length < 3) {
      throw new Error(
        "El nombre del evento no puede estar vacío y debe ser mayor a 3 caracteres",
      );
    }
    if (props.availableSeats < 0) {
      throw new Error("Los asientos disponibles no pueden ser negativos");
    }
    if (props.availableSeats > props.totalCapacity) {
      throw new Error(
        "Los asientos disponibles no pueden ser mayores a la capacidad del recinto");
    }
    if (props.totalCapacity <= 0) {
      throw new Error("La capacidad del recinto debe ser mayor a 0");
    }
    if (props.cost <= 0) {
      throw new Error("El costo del evento debe ser mayor a 0.");
    }
    if (!props.venueId || props.venueId.trim() === "") {
      throw new Error("El ID del lugar no puede estar vacío.");
    }
  }
  private static validateCreationRules(props: Evento) {
    const now = new Date();
    if (props.date < now) {
      throw new Error(
        "La fecha del evento no puede ser anterior a la fecha actual.",
      );
    }
  }
}
