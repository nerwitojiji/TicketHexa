# 📘 Guía Definitiva: APIs y Casos de Uso (Arquitectura Hexagonal)

Esta guía documenta el paso a paso para crear un flujo completo de entrada en nuestra aplicación Next.js, respetando la Arquitectura Hexagonal.

## 🗺️ El Flujo Mental (La Regla de Oro)
Nunca saltarse este orden. El flujo de datos siempre va de "afuera" hacia "adentro" y luego sale de nuevo:
1. **Cliente (Frontend/Postman)** envía un JSON.
2. **API Route (El Mesero)** recibe el JSON y se lo pasa al Caso de Uso.
3. **Caso de Uso (El Director)** coordina la creación de la Entidad y llama al Repositorio.
4. **Repositorio (El Trabajador)** traduce la orden y guarda en la Base de Datos.

---

## PASO 1: Crear el Caso de Uso (El Director de Orquesta) 🎼

El Caso de Uso NO contiene lógica de negocio (eso es de la Entidad) ni sabe de SQL (eso es del Repositorio). Solo coordina los pasos.

**Ubicación:** `src/core/application/use-cases/NombreAccionUseCase.ts`

### Sintaxis y Conceptos Clave:
* **DTO (Data Transfer Object):** Una `interface` que define exactamente qué datos esperamos recibir del mundo exterior. Actúa como un filtro de seguridad.
* **Inyección de Dependencias:** El Caso de Uso nunca instancia su propia base de datos. Pide por el `constructor` que le pasen un trabajador que cumpla con un contrato (el Puerto o Interfaz).
* **Instanciar (`new`):** Usar el "plano" (Clase/Entidad) para crear un "objeto real" en memoria.
* **Notación de Punto (`.`):** Sirve para acceder a los métodos o propiedades "dentro de" un objeto (Ej: `this.repositorio.guardar()`).

### Plantilla de Código:

```typescript
// 1. Importar la Entidad y el Puerto (Contrato)
import { MiEntidad } from '../../domain/entities/MiEntidad';
import { IMiRepositorio } from '../../ports/IMiRepositorio';

// 2. Definir el DTO (Los datos que vienen de internet)
export interface CrearEntidadDTO {
  campoUno: string;
  campoDos: number;
}

// 3. Crear la Clase del Caso de Uso
export class CrearEntidadUseCase {
  
  // INYECCIÓN DE DEPENDENCIAS: Pedimos el contrato, no la implementación concreta
  constructor(private readonly repositorio: IMiRepositorio) {}

  // MÉTODO PRINCIPAL (Siempre async si toca base de datos)
  async execute(data: CrearEntidadDTO): Promise<MiEntidad> {
    
    // A. INSTANCIAR LA ENTIDAD
    // Usamos 'new' para construir el objeto usando los datos del DTO
    const nuevaEntidad = new MiEntidad({
      id: crypto.randomUUID(), // Generamos ID si es necesario
      campoUno: data.campoUno,
      campoDos: data.campoDos
    });

    // B. GUARDAR EN LA BASE DE DATOS
    // Usamos el repositorio inyectado y la notación de punto para ejecutar su método
    await this.repositorio.save(nuevaEntidad);

    // C. RETORNAR EL RESULTADO
    return nuevaEntidad;
  }
}

PASO 2: Crear el Endpoint (La API Route / El Mesero) 🍽️
La API es nuestro "Adaptador de Entrada". Su único trabajo es recibir peticiones HTTP, instanciar el Hexágono, ejecutar el Caso de Uso y devolver un Código de Estado (Status Code).

Ubicación: src/app/api/nombre-del-recurso/route.ts (En Next.js App Router, el archivo siempre debe llamarse route.ts)

Sintaxis y Conceptos Clave:
Verbos HTTP: Exportamos funciones asíncronas nombradas exactamente como el verbo que queremos usar (GET, POST, PUT, DELETE).

request.json(): Método asíncrono para leer el cuerpo (body) de la petición que envió el cliente.

NextResponse: El objeto de Next.js usado para construir la respuesta que se enviará de vuelta al cliente, incluyendo el JSON y el Status Code (Ej: 201 para "Creado", 400 para "Error del cliente").

try/catch: Escudo protector. Todo el código va en el try. Si algo falla (ej. base de datos caída o datos inválidos), el error cae en el catch y evitamos que el servidor colapse.


import { NextResponse } from 'next/server';

// Importar el Caso de Uso (Director) y el Repositorio Concreto (Trabajador)
import { CrearEntidadUseCase } from '@/src/core/application/use-cases/CrearEntidadUseCase';
import { DrizzleMiRepositorio } from '@/src/infrastructure/repositories/DrizzleMiRepositorio';

export async function POST(request: Request) {
  try {
    // 1. EXTRAER LOS DATOS DEL CLIENTE
    const body = await request.json();

    // 2. PREPARAR EL HEXÁGONO (Cablear la Inyección de Dependencias)
    // Instanciamos el trabajador real de la BD
    const repository = new DrizzleMiRepositorio(); 
    // Instanciamos el caso de uso y le pasamos el trabajador por el constructor
    const useCase = new CrearEntidadUseCase(repository);

    // 3. EJECUTAR LA ACCIÓN
    const resultado = await useCase.execute({
      campoUno: body.campoUno,
      campoDos: body.campoDos
    });

    // 4. RESPONDER AL CLIENTE (ÉXITO)
    return NextResponse.json(
      { message: "Creado exitosamente", data: resultado },
      { status: 201 } // 201 = Created
    );

  } catch (error: any) {
    // 5. RESPONDER AL CLIENTE (ERROR)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 400 } // 400 = Bad Request
    );
  }
}