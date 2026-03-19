// src/app/api/venues/route.ts
import { NextResponse } from 'next/server';

// 
import { CreateVenueUseCase } from '../../../core/application/use-cases/CreateVenueUseCase';
import { DrizzleVenueRepository } from '@/src/infrastructure/repositories/DrizzelVenueRepository';

export async function POST(request: Request){
    try{
        // 1. Extraer contenido body de POST y transformal dict
        const body = await request.json();

        // 2. Crear instancia Drizzle con métodos para trabajar venue con la DB
        const repository = new DrizzleVenueRepository();

        // 3. Crear instancia Caso uso -> Crear entrada de un venue a la DB. Se le pasa repositpri para que instancia CreateVenueUseCase le delega la implentacion del guardar en la db (para eso existe -> drizzzle + venues)
        const UseCase = new CreateVenueUseCase (repository);

        // 4. Ejecutar guardar informacion de post: Instancia CreateVenueUseCase ejecuta metodo exeecute
        const newVenue = await UseCase.execute({
            name: body.name,
            address : body.address,
            standardCapacity : body.standardCapacity
        });

        // 5. Retornar respuesta al cliente: Para que sepa que se guardo lo enviado en post se envia de vuelta  NextResponse
        return NextResponse.json(
            {mensaje: "Todo salio perfecto", data: newVenue},
            {status: 201}
        );
    }catch(error: any){
        // En caso de error retorna status 400 y mensaje
        return NextResponse.json({error : error.message}, {status: 400});
    };
}

export async function GET (){
    try{
        // 1. Crear instancia DrizzleVenueRepository: encargado de drizzle + vent -> implementacion del como se guardan y buscan datos en db de venue  
        const repository = new DrizzleVenueRepository();
        
        // 2. Buscar todas las entradas de venues en db: repository ejecuta su metodo findAll()
        const result = await repository.findAll();
        
        // 3. Retornar todas las venues a cliente
        return NextResponse.json(result, {status: 200});
    }
    catch (error: any){
        // En caso de error retorna status 400 y mensaje
        console.error("Error en GET /api/venues:", error);
        return NextResponse.json({error : error.message || "error desconocido"}, {status: 500});
    }
}
