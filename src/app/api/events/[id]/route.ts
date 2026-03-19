import { NextResponse } from 'next/server';
import { DrizzleEventRepository } from '@/src/infrastructure/repositories/DrizzelEventRepository';

export async function GET(request: Request, {params}:{params:{id:string}}) {
    try{
        const IdBuscado = params.id
        const repository = new DrizzleEventRepository();
        const result = await repository.findById(IdBuscado);

        if (!result){
            return  NextResponse.json({error: "Dato No encontrado"},{status: 404})
        }
        return NextResponse.json(result,{status:200})
    }
    catch (error: any){
        return NextResponse.json({error: "error al buscar el dato solicitado"}, {status: 500})
    }
}

