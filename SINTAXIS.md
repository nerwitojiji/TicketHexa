# SINTAXIS.md — Chuleta de TicketHexa

> Todo lo que necesitás saber **para lo que ya está construido**. Nada de temas futuros.
> Los ejemplos usan entidades inventadas (`Libro`, `Producto`) a propósito: el código real lo escribís vos.

**Índice**
1. [TypeScript: interface vs class](#1-typescript-interface-vs-class)
2. [Clases: constructor, `this`, modificadores](#2-clases-constructor-this-modificadores)
3. [Async / await y `Promise<T>`](#3-async--await-y-promiset)
4. [Los 4 bloques del hexágono](#4-los-4-bloques-del-hexágono)
5. [Drizzle ORM](#5-drizzle-orm)
6. [Next.js App Router: API Routes](#6-nextjs-app-router-api-routes)
7. [Códigos de estado HTTP](#7-códigos-de-estado-http)
8. [Comandos del día a día](#8-comandos-del-día-a-día)
9. [Probar la API](#9-probar-la-api)
10. [Errores que ya cometiste (o casi)](#10-errores-que-ya-cometiste-o-casi)

---

## 1. TypeScript: interface vs class

La confusión número uno al empezar. Son cosas distintas:

| | `interface` | `class` |
|---|---|---|
| ¿Qué es? | Una **forma**, un contrato | Un **plano** que fabrica objetos |
| ¿Existe en runtime? | ❌ Desaparece al compilar | ✅ Es código JavaScript real |
| ¿Tiene lógica? | Nunca | Sí, métodos y validaciones |
| ¿Se instancia? | No | Sí, con `new` |

```typescript
// INTERFACE: solo describe la forma de los datos. No hace nada.
interface LibroProps {
  id: string;
  titulo: string;
  paginas: number;
}

// CLASS: tiene comportamiento y protege sus reglas.
class Libro {
  constructor(props: LibroProps) { /* ... */ }
}
```

En el proyecto usás `interface` para tres cosas distintas:
- **`XProps`** → forma de los datos que entran al constructor de una entidad.
- **`XDTO`** → forma de los datos que llegan desde internet a un caso de uso.
- **`IXRepository`** → contrato de un puerto.

### El signo `?` (opcional)

```typescript
interface LibroProps {
  id?: string;       // puede venir o no → tipo real: string | undefined
  titulo: string;    // obligatorio
}
```

⚠️ **Trampa que aplica a tu `Ticket`:** el `?` en `Props` significa "el que me llama puede no mandarlo". Pero si el constructor **siempre** le asigna un valor, entonces la propiedad de la *clase* ya no es opcional. Son dos declaraciones separadas y no tienen por qué coincidir:

```typescript
interface LibroProps {
  id?: string;                     // opcional al construir
}

class Libro {
  public readonly id: string;      // SIEMPRE existe después de construir ✅

  constructor(props: LibroProps) {
    this.id = props.id ?? crypto.randomUUID();
  }
}
```

### `??` vs `||`

```typescript
valor ?? porDefecto   // usa porDefecto solo si valor es null o undefined
valor || porDefecto   // usa porDefecto si valor es CUALQUIER falsy: 0, "", false, null, undefined
```

Con `0` la diferencia importa: `0 || 10` da `10` (probablemente no era la idea), `0 ?? 10` da `0`.

### Union types (todavía no lo usás — deberías)

Restringe un `string` a un conjunto cerrado de valores:

```typescript
type EstadoPedido = 'pendiente' | 'enviado' | 'entregado';

let e: EstadoPedido = 'pendiente';  // ✅
let f: EstadoPedido = 'volando';    // ❌ error en tiempo de compilación
```

Con `status: string` el compilador acepta cualquier cosa. Con un union type, el error salta antes de ejecutar.

### `type` vs `interface`

Prácticamente intercambiables para describir objetos. Convención razonable: `interface` para formas de objetos, `type` para uniones y alias.

---

## 2. Clases: constructor, `this`, modificadores

```typescript
export class Libro {
  //  ┌── modificador de acceso
  //  │      ┌── inmutable tras el constructor
  public readonly id: string;
  public titulo: string;
  private codigoInterno: string;   // solo accesible dentro de la clase

  constructor(props: LibroProps) {
    this.validate(props);          // primero valida, después asigna
    this.id = props.id;
    this.titulo = props.titulo;
  }

  // MÉTODO PÚBLICO: comportamiento del dominio (camelCase)
  public renombrar(nuevoTitulo: string): void {
    if (nuevoTitulo.trim().length < 3) {
      throw new Error("Título muy corto");
    }
    this.titulo = nuevoTitulo;
  }

  // MÉTODO PRIVADO: reglas internas, nadie de afuera lo llama
  private validate(props: LibroProps): void {
    if (!props.titulo || props.titulo.trim() === '') {
      throw new Error("El título no puede estar vacío");
    }
  }
}
```

**Reglas de nombres:**

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clase | PascalCase | `Event`, `CreateVenueUseCase` |
| Método | camelCase | `sellTicket()`, `findById()` |
| Propiedad | camelCase | `venueId`, `standardCapacity` |
| Interface de puerto | `I` + PascalCase | `IEventRepository` |
| Archivo de entidad | PascalCase singular | `Ticket.ts`, no `Tickets.ts` |

### Atajo: parámetros de constructor como propiedades

Esto es TypeScript puro y ya lo usás en los casos de uso:

```typescript
// Forma larga
class CrearLibro {
  private readonly repo: ILibroRepository;
  constructor(repo: ILibroRepository) {
    this.repo = repo;
  }
}

// Forma corta — idéntica. El modificador en el parámetro crea y asigna la propiedad.
class CrearLibro {
  constructor(private readonly repo: ILibroRepository) {}
}
```

### `implements`: firmar un contrato

```typescript
export class DrizzleLibroRepository implements ILibroRepository {
  // Si falta un método del contrato, o cambia una firma,
  // TypeScript da error ACÁ, no en tiempo de ejecución. Esa es la ganancia.
}
```

### Validar en el constructor (invariante)

El principio central de las **entidades ricas**: si el objeto existe, es válido. No puede haber un `Libro` a medio construir dando vueltas, porque el constructor lanza antes de terminar.

```typescript
const libro = new Libro({ titulo: "" });  // 💥 throw, el objeto nunca nace
```

⚠️ **Distinción clave para tu `Event`:** hay dos momentos de vida distintos y no comparten reglas.

| Momento | Qué pasa | ¿Vale "la fecha debe ser futura"? |
|---|---|---|
| **Creación** | El usuario manda datos nuevos | ✅ Sí |
| **Reconstitución** | Traés una fila de la BD y la volvés objeto | ❌ **No** — el evento del año pasado existió |

Si la regla de creación vive en el constructor, la reconstitución de datos viejos revienta. Patrón habitual para separarlas: el `constructor` valida solo lo estructural, y un método estático `static create(...)` agrega las reglas de creación.

```typescript
class Libro {
  private constructor(props: LibroProps) { /* validación estructural */ }

  static create(props: LibroProps): Libro {   // camino "nuevo"
    // reglas que solo aplican a lo recién creado
    return new Libro(props);
  }

  static fromDB(props: LibroProps): Libro {   // camino "rehidratar"
    return new Libro(props);
  }
}
```

### Guards de validación: cuidado con la lógica booleana

```typescript
// ❌ Nunca lanza si el valor es "": "" es falsy, el && corta y nunca llega al trim
if (props.campo && props.campo.trim() === '') throw new Error("vacío");

// ✅ Lanza si falta O si es solo espacios
if (!props.campo || props.campo.trim() === '') throw new Error("vacío");

// ✅ Versión compacta con optional chaining
if (!props.campo?.trim()) throw new Error("vacío");
```

**Valores falsy en JS:** `false`, `0`, `-0`, `""`, `null`, `undefined`, `NaN`. Todo lo demás es truthy (incluidos `[]` y `{}`).

---

## 3. Async / await y `Promise<T>`

Todo lo que toca la base de datos es asíncrono: se pide algo y la respuesta llega después.

```typescript
// Promise<T> = "prometo devolverte un T más adelante"
async findById(id: string): Promise<Libro | null> {
  const filas = await db.select().from(librosTable);  // await = "esperá acá"
  //            ^^^^^ sin await, filas sería una Promise, no los datos
  return null;
}
```

Reglas:
- Si una función tiene `await` adentro, tiene que ser `async`.
- Una función `async` **siempre** devuelve una Promise, aunque escribas `return 5`.
- Para consumir una función async: `const x = await miFuncion();`.

**El bug más común:** olvidar el `await`.

```typescript
const evento = this.repo.findById(id);   // ❌ evento es una Promise
if (!evento) { }                         // nunca entra: una Promise siempre es truthy

const evento = await this.repo.findById(id);  // ✅
```

### try / catch

```typescript
try {
  const resultado = await algoQuePuedeFallar();
} catch (error: any) {
  // Cae acá cualquier throw de adentro del try, sin importar cuán profundo esté
  console.error(error.message);
}
```

Un `throw` de tu entidad viaja hacia arriba: entidad → caso de uso → route handler, hasta el primer `catch`. Por eso las rutas API envuelven todo en `try/catch`: son la última barrera antes de que el servidor devuelva un 500 feo.

---

## 4. Los 4 bloques del hexágono

El flujo, siempre en este orden:

```
Cliente → API Route → Caso de Uso → Entidad (reglas)
                            ↓
                          Puerto (interface)
                            ↓
                       Repositorio Drizzle → PostgreSQL
```

**La regla de dependencias:** las flechas de `import` apuntan hacia adentro. `infrastructure` importa de `core`. `core` **nunca** importa de `infrastructure`. Si en un archivo de `core/` aparece un `import` de Drizzle o de Next, el hexágono está roto.

### A. Entidad — `src/core/domain/entities/`
Reglas de negocio puras. Cero imports externos. Sabe decir "no" cuando le piden algo inválido.

### B. Puerto — `src/core/ports/`
Una `interface` que declara **qué** se puede hacer, sin decir **cómo**.

```typescript
import { Libro } from '../domain/entities/Libro';

export interface ILibroRepository {
  save(libro: Libro): Promise<void>;
  findById(id: string): Promise<Libro | null>;
  findAll(): Promise<Libro[]>;
}
```

Fijate que el puerto habla en **objetos de dominio** (`Libro`), no en filas de SQL. Ahí está el aislamiento.

### C. Caso de uso — `src/core/application/use-cases/`
Coordina. No tiene reglas de negocio (eso es de la entidad) ni SQL (eso es del repositorio).

```typescript
export interface CrearLibroDTO {   // lo que llega de afuera
  titulo: string;
  paginas: number;
}

export class CrearLibroUseCase {
  constructor(private readonly repo: ILibroRepository) {}
  //                                  ^^^^^^^^^^^^^^^^
  //          pide la INTERFACE, no la clase concreta. Esto es la inyección
  //          de dependencias: en tests le pasás un repo falso en memoria
  //          y probás la lógica sin levantar Postgres.

  async execute(data: CrearLibroDTO): Promise<Libro> {
    const libro = new Libro({ id: crypto.randomUUID(), ...data });
    await this.repo.save(libro);
    return libro;
  }
}
```

**¿Por qué un DTO y no pasar el `body` crudo?** El DTO es un filtro: define exactamente qué campos entran. Si el cliente manda `{ titulo: "x", esAdmin: true }`, `esAdmin` se descarta porque no está en el DTO. Es una frontera de seguridad, no burocracia.

### D. Adaptador — `src/infrastructure/repositories/`
Firma el contrato y traduce entre el mundo de objetos y el mundo de tablas.

```typescript
export class DrizzleLibroRepository implements ILibroRepository {
  async findById(id: string): Promise<Libro | null> {
    const filas = await db.select().from(librosTable).where(eq(librosTable.id, id));
    if (filas.length === 0) return null;

    // MAPEO: fila plana de SQL → objeto rico de dominio
    return new Libro({
      id: filas[0].id,
      titulo: filas[0].titulo,
    });
  }
}
```

Ese mapeo es el corazón del patrón. Nunca dejes escapar una fila cruda de Drizzle fuera de `infrastructure/`.

---

## 5. Drizzle ORM

### Definir tablas — `src/infrastructure/db/schema.ts`

```typescript
import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const librosTable = pgTable('libros', {
  //                                 ^^^^^^ nombre real de la tabla en Postgres
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  paginas: integer('paginas').notNull(),
  estado: varchar('estado', { length: 50 }).notNull().default('disponible'),
  creadoEn: timestamp('created_at').defaultNow().notNull(),
  //                   ^^^^^^^^^^ columna en snake_case, propiedad en camelCase
  autorId: uuid('autor_id').notNull().references(() => autoresTable.id),
});
```

| Modificador | Qué hace |
|---|---|
| `.primaryKey()` | Clave primaria |
| `.notNull()` | Prohíbe NULL |
| `.unique()` | Sin duplicados |
| `.defaultRandom()` | UUID automático (solo en `uuid`) |
| `.defaultNow()` | Timestamp actual (solo en `timestamp`) |
| `.default(x)` | Valor por defecto |
| `.references(() => tabla.columna)` | Foreign key |

⚠️ **Foreign keys y el orden de inserción.** Si `orders.userId` referencia `users.id`, Postgres **rechaza** cualquier inserción con un `userId` que no exista en `users`. No importa que tu entidad esté perfectamente validada: la BD tiene la última palabra. Para insertar un ticket primero tiene que existir el usuario.

`{ mode: 'date' }` en un `timestamp` le dice a Drizzle que te devuelva un objeto `Date` de JavaScript en vez de un string.

### Consultas

```typescript
import { eq, and, gt } from 'drizzle-orm';

// SELECT * FROM libros
const todos = await db.select().from(librosTable);
// → devuelve SIEMPRE un array, aunque esté vacío

// SELECT * FROM libros WHERE id = ?
const uno = await db.select().from(librosTable).where(eq(librosTable.id, id));
// → TAMBIÉN un array, aunque traiga un solo elemento.
//   Por eso el patrón: if (uno.length === 0) return null; luego uno[0]

// INSERT
await db.insert(librosTable).values({ id, titulo, paginas });

// INSERT devolviendo la fila creada
const [creado] = await db.insert(librosTable).values({...}).returning();

// UPDATE ... WHERE  ← ¡el .where() no es opcional en la práctica!
await db.update(librosTable)
  .set({ titulo: 'nuevo' })
  .where(eq(librosTable.id, id));

// DELETE
await db.delete(librosTable).where(eq(librosTable.id, id));

// Condiciones compuestas
.where(and(eq(librosTable.estado, 'disponible'), gt(librosTable.paginas, 100)))
```

🚨 **Un `update` o `delete` sin `.where()` afecta TODAS las filas de la tabla.** Drizzle no te va a detener.

Operadores frecuentes: `eq` (=), `ne` (≠), `gt` / `gte` (> / ≥), `lt` / `lte` (< / ≤), `inArray`, `isNull`, `like`, y los combinadores `and` / `or` / `not`.

### Tipos inferidos

```typescript
export type LibroRecord = typeof librosTable.$inferSelect;  // forma al leer
export type NewLibroRecord = typeof librosTable.$inferInsert; // forma al insertar
```

Si cambiás una columna del schema, estos tipos cambian solos y TypeScript te marca todos los lugares que hay que ajustar.

### Comandos de drizzle-kit

```bash
npx drizzle-kit push      # aplica el schema directo a la BD (rápido, para desarrollo)
npx drizzle-kit generate  # genera archivos .sql de migración (para producción)
npx drizzle-kit migrate   # aplica las migraciones generadas
npx drizzle-kit studio    # GUI para ver/editar la BD en el navegador
```

En desarrollo `push` alcanza. En producción se usa `generate` + `migrate` porque deja historial versionado de los cambios.

---

## 6. Next.js App Router: API Routes

### La regla de los nombres

En App Router **la carpeta es la URL** y el archivo se llama siempre `route.ts`:

```
src/app/api/venues/route.ts        →  /api/venues
src/app/api/venues/[id]/route.ts   →  /api/venues/cualquier-cosa
src/app/api/tickets/route.ts       →  /api/tickets
```

`route.ts` en singular. `routes.ts` no lo detecta el framework y la ruta simplemente devuelve 404.

### Handlers = verbos HTTP exportados

Exportás una función `async` con el nombre del verbo, en MAYÚSCULAS:

```typescript
import { NextResponse } from 'next/server';

export async function GET() { }
export async function POST(request: Request) { }
export async function PUT(request: Request) { }
export async function DELETE(request: Request) { }
```

### Leer el body

```typescript
const body = await request.json();   // async: hay que esperar a que llegue el cuerpo
```

⚠️ `body` es **`any`**. Todo lo que venga de internet es texto sin garantías: `body.paginas` puede ser `"muchas"`, `null` o no venir. Hoy tu única defensa es la validación de la entidad — funciona, pero el error salta más adentro de lo ideal.

### Parámetros dinámicos (`[id]`)

En Next 15+ `params` es una **Promise** y hay que esperarla:

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;   // ← sin el await, id sería undefined
}
```

### Responder

```typescript
return NextResponse.json(
  { mensaje: "Creado", data: resultado },  // 1er argumento: el cuerpo JSON
  { status: 201 }                          // 2do: opciones (status, headers)
);
```

### Cableado del hexágono en la ruta

La ruta es el único lugar donde se conecta el mundo abstracto con el concreto:

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const repository = new DrizzleLibroRepository();   // implementación concreta
    const useCase = new CrearLibroUseCase(repository); // se la inyectás al caso de uso

    const resultado = await useCase.execute({
      titulo: body.titulo,
      paginas: body.paginas,
    });

    return NextResponse.json({ data: resultado }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

Este es el punto exacto donde el hexágono se "enchufa". Cambiar Drizzle por otra cosa significa tocar **solo esta línea**, en ningún otro lado. Ese es el premio de toda la arquitectura.

---

## 7. Códigos de estado HTTP

| Código | Significado | Cuándo usarlo acá |
|---|---|---|
| **200** OK | Salió bien | GET exitoso |
| **201** Created | Recurso creado | POST exitoso |
| **204** No Content | Bien, sin cuerpo | DELETE exitoso |
| **400** Bad Request | El cliente mandó mal los datos | Falló la validación de la entidad |
| **404** Not Found | No existe el recurso | `findById` devolvió `null` |
| **409** Conflict | Choca con el estado actual | Sin capacidad, sobreventa |
| **422** Unprocessable | Bien formado pero semánticamente inválido | Alternativa a 400 |
| **500** Server Error | Se rompió el servidor | BD caída, bug inesperado |

**La regla mental:** `4xx` = culpa del cliente. `5xx` = culpa tuya.

Hoy todos tus errores caen en 400. El problema: `catch` recibe un `Error` genérico y no puede distinguir "capacidad insuficiente" (409) de "evento no existe" (404) de "la BD explotó" (500). La solución idiomática son clases de error propias:

```typescript
export class LibroNotFoundError extends Error {
  constructor(id: string) {
    super(`Libro ${id} no encontrado`);
    this.name = 'LibroNotFoundError';
  }
}

// En la ruta, el catch ya puede decidir:
catch (error) {
  if (error instanceof LibroNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
```

---

## 8. Comandos del día a día

```bash
npm run dev              # servidor de desarrollo en http://localhost:3000
npm run build            # build de producción (falla si hay errores de tipos)
npm run lint             # ESLint

npx tsc --noEmit         # ⭐ el más útil: chequea TODOS los tipos sin generar archivos
npx drizzle-kit push     # sincroniza el schema con la BD
npx drizzle-kit studio   # GUI de la base de datos
```

Costumbre sana: `npx tsc --noEmit` después de cada bloque de código. Es más rápido que levantar el server y te muestra todos los errores de golpe.

---

## 9. Probar la API

Con el servidor corriendo (`npm run dev`):

```bash
# POST — crear
curl -X POST http://localhost:3000/api/venues \
  -H "Content-Type: application/json" \
  -d '{"name":"Teatro Caupolicán","address":"San Diego 850","standardCapacity":3000}'

# GET — listar
curl http://localhost:3000/api/venues

# GET — por id
curl http://localhost:3000/api/venues/EL-UUID-QUE-TE-DEVOLVIO
```

En PowerShell, `curl` es un alias de `Invoke-WebRequest` y la sintaxis cambia. Usá `curl.exe` explícitamente, o mejor Postman / Thunder Client / la extensión REST Client de VS Code.

**Orden obligatorio para probar:** primero creá un `venue` → copiá su `id` → usalo como `venueId` al crear un `event`. Al revés falla por foreign key.

---

## 10. Errores que ya cometiste (o casi)

Guardá esta lista, son los que más se repiten:

1. **Import fantasma** — `import { error } from "console"` que nunca se usa. El linter lo marca; borralos.
2. **`&&` donde va `||` en un guard** — `if (x && x.trim() === '')` nunca detecta `""`. Repasá la sección de valores falsy.
3. **Doble `;;`** — no rompe nada, pero delata copy-paste.
4. **`excecute` vs `execute`** — un typo en un nombre de método convierte dos clases que "hacen lo mismo" en dos clases incompatibles. TypeScript no te avisa porque no hay interface que obligue.
5. **Método en PascalCase** — `SellTicket()` parece un constructor. Métodos siempre en camelCase.
6. **`routes.ts` en vez de `route.ts`** — Next no lo registra y la ruta devuelve 404 sin ningún error visible.
7. **Falta de `await`** — la variable queda con una Promise adentro y toda condición sobre ella es truthy.
8. **Import no usado en el schema** (`decimal`) — ruido que confunde al leer.
9. **Validar reglas de creación en el constructor** — rompe la reconstitución desde la BD. Ver sección 2.
10. **`.env*` en `.gitignore`** — también ignora `.env.example`, que sí querés versionar. Se arregla con una línea de excepción `!`.

---

## Apéndice: el diccionario

| Término | Traducción práctica |
|---|---|
| **Entidad** | Objeto con identidad propia y reglas que se autoprotegen |
| **Puerto** | Interface que define qué se necesita, sin decir cómo |
| **Adaptador** | Clase concreta que implementa un puerto con tecnología real |
| **DTO** | Interface que describe los datos que cruzan una frontera |
| **Caso de uso** | Coordinador de un flujo completo de negocio |
| **Inyección de dependencias** | Recibir lo que necesitás por constructor en vez de fabricarlo adentro |
| **Invariante** | Regla que siempre debe cumplirse mientras el objeto exista |
| **Reconstitución** | Rearmar un objeto de dominio desde datos guardados |
| **Mapeo** | Traducir entre fila de BD y objeto de dominio |
| **Aggregate** | Grupo de entidades que se modifican como una sola unidad |

---

*Actualizá este archivo cuando aparezcan conceptos nuevos: transacciones, Vitest, Docker, Zod.*
