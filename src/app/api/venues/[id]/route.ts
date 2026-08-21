import { NextResponse } from 'next/server';
import { DrizzleVenueRepository } from '@/src/infrastructure/repositories/DrizzleVenueRepository';


export async function GET(request: Request, {params}:{params:Promise<{id:string}>}) {
    try{
        // 1. Extraer ID de busqueda
        const parametros = await params;
        const id = parametros.id;

        // 2. Crear instancia DrizzleVenueRepository: encargado de drizzle + vent -> implementacion del como se guardan y buscan datos en db de venue  
        const repository = new DrizzleVenueRepository();
        
        // 3. Buscar venue con id 
        const result = await repository.findById(id);

        // 4.1 Retorna Venue si existe
        if (!result){
            return  NextResponse.json({error: "Dato No encontrado"},{status: 404})
        }
        // 4.2 Retorna {} en caso de no exitir ninguna venue con ese id
        return NextResponse.json(result,{status:200})
    }
    catch (error: any){
        // En caso de error retorna status 400 y mensaje
        return NextResponse.json({error: "error al buscar el dato solicitado"}, {status: 500})
    }
}