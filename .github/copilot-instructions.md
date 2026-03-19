---
name: tickethexa-instructions
description: Convenciones actualizadas de TicketHexa para arquitectura hexagonal, TypeScript, Next.js App Router y Drizzle ORM
applyTo: "**/*.{ts,tsx}"
---

# Instrucciones de Desarrollo TicketHexa

Estas instrucciones reflejan el estado actual del proyecto y deben aplicarse en todo el codigo TypeScript/TSX.

## Estado Actual del Proyecto (Fuente de Verdad)

Estructura vigente:

```text
src/
  app/                              # Next.js App Router
    api/
      events/
        routes.ts                   # Actualmente existe asi (ver nota de estandar)
  components/
    ui/
      button.tsx
  core/
    application/
      use-cases/
        CreateEventUseCase.ts
    domain/
      entities/
        Event.ts
    ports/
      IEventRepository.ts
  infrastructure/
    db/
      index.ts
      schema.ts
    repositories/
      DrizzelEventRepository.ts
  lib/
    utils.ts
```

Notas de contexto importantes:
- El alias de TypeScript activo es `@/*` hacia la raiz del repo.
- En la practica, se usa `@/src/...` para importar desde `src`.
- El schema activo de Drizzle esta en `src/infrastructure/db/schema.ts`.
- Existe `db/schema.ts` en raiz pero esta vacio; no usarlo como referencia principal.

## Arquitectura y Organización del Código

### Estructura Hexagonal/DDD

TicketHexa sigue un enfoque hexagonal con separacion por capas:

```text
src/
  core/                            # Dominio y casos de uso
    application/use-cases/         # Orquestacion de acciones
    domain/
      entities/                    # Reglas de negocio
    ports/                         # Contratos (interfaces)
  infrastructure/                  # Adaptadores externos (DB, APIs)
    db/
    repositories/
  app/                             # Entrada HTTP (API routes) y UI App Router
  components/                      # Componentes de UI
```

**Reglas:**
- `core/domain` no importa de `infrastructure` ni de `app/components`.
- `core/ports` define contratos; `infrastructure` los implementa.
- Los casos de uso viven en `core/application/use-cases` y coordinan dominio + puertos.
- Las rutas API (`src/app/api/**`) actuan como adaptadores de entrada: parsean request, instancian caso de uso y devuelven `NextResponse`.
- Preferir import relativo dentro de la misma capa y `@/src/...` entre capas.

### Entidades y Objetos de Valor

**Entidades:**
- Definir una interfaz `Props` para constructor.
- Mantener `id` como `readonly`.
- Validar invariantes dentro de la entidad (`constructor` + metodo privado `validate`).
- No mover reglas de negocio a la ruta API.

```typescript
// Ejemplo alineado con el proyecto actual
interface EventProps {
  id?: string;
  name: string;
  date: Date;
  capacity: number;
  cost: number;
  venueId: string;
}

export class Event {
  public readonly id?: string;
  public name: string;
  public date: Date;
  public capacity: number;
  public cost: number;
  public venueId: string;

  constructor(props: EventProps) {
    this.validate(props);
    this.id = props.id;
    this.name = props.name;
    // ...
  }

  private validate(props: EventProps): void {
    if (!props.name?.trim()) {
      throw new Error("El nombre del evento es requerido");
    }
    if (props.capacity <= 0) {
      throw new Error("La capacidad debe ser mayor a 0");
    }
    if (props.cost <= 0) {
      throw new Error("El costo del evento debe ser mayor a 0");
    }
  }
}
```

**Objetos de valor (cuando se agreguen):**
- Usar objetos inmutables para conceptos de dominio repetibles (por ejemplo `Money`, `Email`).
- Evitar primitivos dispersos cuando un concepto tenga reglas propias.

---

## TypeScript y Seguridad de Tipos

### Modo Estricto

- `strict: true` esta habilitado.
- Tipar parametros y retornos de funciones publicas.
- Evitar `any`; usar `unknown` y hacer narrowing.
- `Promise<T>` explicito en metodos async.

### Enfoque Primero en Tipos

Definir contratos primero y luego implementacion:

```typescript
interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
}

export class DrizzleEventRepository implements IEventRepository {
  // implementacion
}
```

### Convenciones de Nombres

| Elemento de Código | Patrón | Ejemplo |
|------------------|---------|---------|
| **Interfaces** | `I[Nombre]` o `[Nombre]Port` | `IEventRepository`, `EventRepositoryPort` |
| **Clases** | PascalCase | `Event`, `UserService` |
| **Funciones** | camelCase | `calculateTotal()`, `formatDate()` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| **Props de Tipo/Interfaz** | [Nombre]`Props` | `EventProps`, `ButtonProps` |
| **Archivos** | PascalCase (entidades/casos de uso), camelCase (utilidades), kebab-case opcional en UI | `Event.ts`, `CreateEventUseCase.ts`, `button.tsx` |

Notas para consistencia con el repo actual:
- Mantener nombres existentes aunque tengan typo historico (`DrizzelEventRepository.ts`) para evitar cambios involuntarios amplios.
- En codigo nuevo, preferir `Drizzle...` correctamente escrito.

### Genéricos y Tipos Avanzados

Usa genéricos para patrones reutilizables:

```typescript
// ✅ Patrón de repositorio con genéricos
interface Repository<T extends { id?: string }> {
  save(entity: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

// Usa uniones discriminadas para manejo de estado type-safe
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

// Tipos utilidad para patrones comunes
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};
```

---

## React y Patrones de Componentes

### Estructura de Componentes

Usar componentes funcionales con TypeScript. Basarse en el estilo actual de `src/components/ui/button.tsx` (CVA + `cn` + variantes).

```typescript
type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
```

### CVA (Class Variance Authority)

Usar CVA para variantes, evitando condicionales extensos en `className`.

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
```

### Organización de Componentes

- Componentes base en `src/components/ui/`.
- Componentes de feature en `src/components/features/...` cuando aparezcan.
- Reusar `src/lib/utils.ts` para `cn()`.

### Estilos

- Usar Tailwind CSS.
- Usar `cn()` para componer clases:
  ```typescript
  import { cn } from '@/src/lib/utils';

  className={cn('clase-base', isActive && 'clase-activa', customClassName)}
  ```
- Evitar estilos inline salvo casos muy puntuales.

---

## Base de Datos y ORM (Drizzle)

### Diseño de Schema

- Definir tablas en `src/infrastructure/db/schema.ts`.
- Usar `snake_case` para columnas en DB (`creator_id`, `venue_id`, etc.).
- Mantener entidades de dominio separadas del schema de Drizzle.

```typescript
import { pgTable, uuid, varchar, timestamp, integer } from 'drizzle-orm/pg-core';

export const eventsTable = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  capacity: integer('capacity').notNull(),
  creatorId: uuid('creator_id'),
  venueId: uuid('venue_id').notNull(),
});
```

### Patrón de Repositorio (Puertos y Adaptadores)

**Puerto (Contrato):**
```typescript
// src/core/ports/IEventRepository.ts
import { Event } from '../domain/entities/Event';

export interface IEventRepository {
  save(event: Event): Promise<void>;
  findById(id: string): Promise<Event | null>;
  findAll(): Promise<Event[]>;
}
```

**Adaptador (Implementación):**
```typescript
// src/infrastructure/repositories/DrizzelEventRepository.ts
import { db } from '../db';
import { eventsTable } from '../db/schema';
import { Event } from '../../core/domain/entities/Event';
import { IEventRepository } from '../../core/ports/IEventRepository';

export class DrizzleEventRepository implements IEventRepository {
  async save(event: Event): Promise<void> {
    await db.insert(eventsTable).values({
      id: event.id,
      name: event.name,
      date: event.date,
      capacity: event.capacity,
      cost: event.cost,
      venueId: event.venueId,
    });
  }

  async findById(id: string): Promise<Event | null> {
    throw new Error('Metodo no implementado todavia');
  }
}
```

**Patrón de Mapeo:**
- Mantener mapper explicito entre `Event` (dominio) y record Drizzle.
- Evitar exponer registros SQL crudos fuera de infraestructura.

---

## Calidad del Código y Mejores Prácticas

### Manejo de Errores

- Preferir errores de dominio tipados para reglas de negocio.
- En rutas API, retornar errores consistentes con `NextResponse.json`.

```typescript
export class EventNotFoundError extends Error {
  constructor(id: string) {
    super(`Evento con id ${id} no encontrado`);
    this.name = 'EventNotFoundError';
  }
}

export class InvalidEventError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEventError';
  }
}
```

### Async/Promises

- Usar `async/await`.
- Tipar `Promise<T>`.
- Manejar errores con `try/catch` en adaptadores de entrada (rutas).

```typescript
async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    return await eventRepository.findByUserId(userId);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      return [];
    }
    throw error; // Re-lanza errores inesperados
  }
}
```

### Comentarios y Documentación

- Comentarios breves para explicar por que, no para narrar cada linea.
- JSDoc en funciones publicas complejas o casos de uso criticos.

### Estrategia de Testing (Futuro)

- Tests unitarios para entidades de dominio y lógica de negocio
- Tests de integración para repositorios
- Tests E2E para flujos críticos de usuario
- Nombres de test: `should[Acción]When[Condición]`

```typescript
// Ejemplo de estructura de test (cuando se agreguen tests)
describe('Entidad Event', () => {
  describe('constructor', () => {
    it('should crear evento cuando todos los props son válidos', () => {
      // Arrange, Act, Assert
    });

    it('should lanzar error cuando la capacidad es negativa', () => {
      // Arrange, Act, Assert
    });
  });
});
```

---

## Linting y Formateo

- Ejecuta `npm run lint` antes de hacer commit
- ESLint hará cumplir las reglas de estilo de código
- Corrige problemas con `eslint --fix`
- No se permiten errores de linting sin resolver en la rama principal

---

## Trampas Comunes a Evitar

| ❌ No Hagas | ✅ Haz |
|------------|------|
| Importa infraestructura en dominio | Importa puertos del dominio en infraestructura |
| Usa tipo `any` | Usa `unknown` o tipos explícitos |
| Pon lógica de negocio en rutas | Pon lógica en entidades de dominio y casos de uso |
| Mezcla schema de BD con entidades | Mapea entre capas de forma explicita |
| Mutacion sin control en entidades | Mantiene invariantes y valida en constructor |
| Manejo de errores inconsistente | Crea errores personalizados tipados |
| Números mágicos hardcodeados inline | Usa constantes nombradas con significado de dominio |
| Test de UI en lugar de lógica principal | Test de dominio, integra con infraestructura |

---

## Nomenclatura de Archivos y Carpetas

```text
src/
  core/
    application/
      use-cases/
        CreateEventUseCase.ts
    domain/
      entities/
        Event.ts                     # PascalCase, singular
    ports/
      IEventRepository.ts            # Prefijo I o sufijo Port
  infrastructure/
    db/
      schema.ts
      index.ts
    repositories/
      DrizzelEventRepository.ts      # Nombre actual del repo
  app/
    api/
      events/
        routes.ts                    # Actual; estandar recomendado: route.ts
  components/
    ui/
      button.tsx
  lib/
    utils.ts
```

Estandar recomendado para nuevos endpoints:
- En Next.js App Router usar `route.ts` (singular) por convencion del framework.
- Si se renombra `routes.ts` a `route.ts`, hacerlo en un cambio dedicado para evitar mezclar refactor con logica funcional.

---

## Resumen

Sigue estos principios en cada archivo:
1. **Arquitectura**: Respetar limites entre dominio, aplicacion, infraestructura y adaptadores de entrada.
2. **Tipos**: Tipos explícitos siempre; sin `any`; modo estricto habilitado
3. **Componentes**: Funcionales + TypeScript; usa CVA para variantes
4. **Base de Datos**: Separacion limpia entre entidades y schema Drizzle; usa patron de repositorio
5. **Errores**: Errores personalizados tipados específicos del dominio
6. **Testing**: Enfocarse en logica de dominio y rutas criticas
7. **Estilo**: Nombres consistentes, código legible, autodocumentado

Cuando haya dudas, usar como referencia los patrones existentes en `Event`, `IEventRepository`, `CreateEventUseCase` y `DrizzelEventRepository`.
