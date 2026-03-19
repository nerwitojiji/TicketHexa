//1. TIPOS:
// Define la forma de los datos para crear un lugar.
export interface VenueProps {
    id ?: string; // ? significa que es opcional (porque la base de datos lo genera automáticamente)
    name: string;
    address: string;
    standardCapacity: number; // Capacidad física del recinto
}

//2. LA ENTIDAD:
export class Venue {
    public readonly id?: string;
    public name: string;
    public address: string;
    public standardCapacity: number;

    // 3. CONSTRUCTOR:
    constructor(props: VenueProps) {
        this.validate(props);

        this.id = props.id;
        this.name = props.name;
        this.address = props.address;
        this.standardCapacity = props.standardCapacity;
    }

    private validate(props: VenueProps) {
        if (!props.name || props.name.trim() === '') {
            throw new Error("El nombre del lugar no puede estar vacío.");
        }
        if (props.standardCapacity <= 0){
            throw new Error("La capacidad estándar debe ser mayor a 0.");
        }
        if (!props.address || props.address.trim() === '') {
            throw new Error("La dirección del lugar no puede estar vacía.");
        }
    }
}