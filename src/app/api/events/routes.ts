// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
// importamos los casos de uso (el director)
// y nuestro repositorio (el trabajador)
import { CreateEventUseCase } from '../../../core/application/use-cases/CreateEventUseCase';
import { DrizzleEventRepository } from '@/src/infrastructure/repositories/DrizzelEventRepository';

export async function POST (request: Request){
    try{
        //1. extraer los datos
        // Usa el objeto 'request' para extraer el JSON que nos envía el cliente.
        const body = await request.json();
        // 2. PREPARAR EL HEXÁGONO (Inyección de dependencias)
        // Instancia el trabajador de la base de datos
        const repository = new DrizzleEventRepository();
        // Instancia el caso de uso y pásale el trabajador
        const UseCase = new CreateEventUseCase (repository);
        // 3. EJECUTAR LA ACCIÓN
        // Llama al método del caso de uso que hace el trabajo y pásale los datos del 'body'
        // Recuerda que el 'date' viene como un string desde internet, así que hay que convertirlo a Date: new Date(body.date)
        const newEvent = await UseCase.execute({
            name : body.name,
            date : new Date(body.date),
            capacity: body.capacity,
            cost : body.cost,
            venueId: body.venueid
        });
        // 4. RESPONDER AL CLIENTE
        // Devuelve un NextResponse en formato JSON indicando que todo salió bien (Status 201)
        return NextResponse.json(
            {mensaje: "Todo salio perfecto", data: newEvent},
            {status: 201}
        );
    }
    catch(error: any){
        // Si algo falla, el Caso de Uso lanzará un error y caerá aquí.
    // Retornamos un NextResponse.json con el error y status 400 (Bad Request)
    return NextResponse.json({error : error.message}, {status: 400});
    }
}
