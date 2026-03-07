---
name: tickethexa-instructions
description: Convenciones del proyecto TicketHexa para arquitectura, TypeScript, React, diseño de base de datos y calidad de código
applyTo: "**/*.{ts,tsx}"
---

# Instrucciones de Desarrollo TicketHexa

Estas instrucciones garantizan consistencia en la calidad del código, mantenibilidad y alineación con nuestra arquitectura hexagonal. Aplica estas pautas a todo el código TypeScript y React en este proyecto.

## Arquitectura y Organización del Código

### Estructura Hexagonal/DDD

TicketHexa sigue principios de Domain-Driven Design con clara separación de responsabilidades:

```
src/
  core/                    # Lógica de dominio (independiente de frameworks)
    domain/
      entities/            # Entidades de negocio principales con validación
      value-objects/       # Objetos de valor inmutables
      enums/               # Enumeraciones del dominio
    ports/                 # Interfaces/contratos (repositorios abstractos, servicios)
    use-cases/             # Orquestación de lógica de negocio
  infraestructure/         # Implementaciones externas
    db/                    # Persistencia de datos (Drizzle ORM)
    external/              # Clientes de API, integraciones de terceros
  presentation/            # Capa de interfaz de usuario (React, Next.js)
    app/                   # Rutas y layouts de Next.js
    components/            # Componentes de React
      ui/                  # Componentes base de UI (shadcn/ui)
      features/            # Componentes específicos de características
```

**Reglas:**
- **Capa de dominio** (`core/domain`) NO DEBE importar de capas de infraestructura o presentación
- **Puertos** (`core/ports`) definen interfaces; la infraestructura las implementa
- **Infraestructura** (`infraestructure/`) implementa puertos y maneja preocupaciones externas
- **Presentación** depende del dominio e infraestructura, pero el dominio nunca depende de presentación
- Usa importaciones relativas dentro de capas, importaciones absolutas (`@/`) entre capas

### Entidades y Objetos de Valor

**Entidades:**
- Define una interfaz `Props` primero para los parámetros del constructor
- Usa `readonly` para propiedades inmutables (especialmente `id`)
- Incluye lógica de validación en el constructor
- Mantén las reglas de negocio dentro de la entidad

```typescript
// ✅ BUENO
interface EventProps {
  id?: string;
  name: string;
  date: Date;
  capacity: number;
  location: string;
}

export class Event {
  public readonly id?: string;
  public name: string;
  public date: Date;
  public capacity: number;
  public location: string;

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
  }
}
```

**Objetos de Valor:**
- Usa objetos inmutables para conceptos del dominio (ej. Email, Money, Location)
- Sobrescribe comparación de igualdad para semántica de valor

---

## TypeScript y Seguridad de Tipos

### Modo Estricto

- TypeScript estricto está habilitado: `strict: true` en `tsconfig.json`
- Todas las variables, parámetros y retornos deben estar explícitamente tipados
- Sin tipo `any` a menos que sea absolutamente inevitable (y debe justificarse en un comentario)
- Usa `unknown` en lugar de `any` cuando el tipo es verdaderamente desconocido

### Enfoque Primero en Tipos

Define tipos antes de la implementación:

```typescript
// ✅ BUENO - Tipos primero
interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

// Define la interfaz, luego implementa
export class UserRepositoryAdapter implements UserRepositoryPort {
  // implementación
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
| **Archivos** | PascalCase (entidades), camelCase (utilidades) | `Event.ts`, `userRepository.ts` |

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

Usa componentes funcionales con TypeScript:

```typescript
// ✅ BUENO
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(
  ({ className, variant = 'default', size = 'md', isLoading, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    />
  )
);

Button.displayName = 'Button';
```

### CVA (Class Variance Authority)

Usa CVA para variantes de componentes en lugar de clases condicionales inline:

```typescript
// ✅ BUENO - Usa CVA
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;
// Luego usa: interface ButtonProps extends ButtonVariants { ... }
```

### Organización de Componentes

- Mantén componentes de UI en `components/ui/` (componentes base, estilo shadcn/ui)
- Los componentes específicos de características van en `components/features/[nombre-feature]/`
- Un componente por archivo (a menos que estén fuertemente acoplados)
- Exporta el componente y su interfaz de tipos

### Estilos

- Usa **Tailwind CSS** para todos los estilos
- Usa la utilidad `cn()` de `lib/utils.ts` para combinar clases:
  ```typescript
  import { cn } from '@/src/lib/utils';
  
  className={cn('clase-base', isActive && 'clase-activa', customClassName)}
  ```
- Evita objetos `style` inline; usa clases de Tailwind
- Modo oscuro: usa el prefijo `dark:` para variantes de modo oscuro

---

## Base de Datos y ORM (Drizzle)

### Diseño de Schema

- Define todas las tablas en `db/schema.ts`
- Usa snake_case para nombres de columnas en la base de datos
- Usa PascalCase para nombres de entidades TypeScript

```typescript
// ✅ BUENO
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  event_date: timestamp('event_date').notNull(), // snake_case en BD
  capacity: integer('capacity').notNull(),
  created_at: timestamp('created_at').defaultNow(),
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
  delete(id: string): Promise<void>;
}
```

**Adaptador (Implementación):**
```typescript
// src/infraestructure/db/EventRepositoryAdapter.ts
import { db } from './index'; // Instancia de Drizzle
import { Event } from '../../core/domain/entities/Event';
import { IEventRepository } from '../../core/ports/IEventRepository';
import { events } from './schema';

export class EventRepositoryAdapter implements IEventRepository {
  async save(event: Event): Promise<void> {
    // Mapea entidad Event al schema de BD e inserta
  }

  async findById(id: string): Promise<Event | null> {
    // Consulta y mapea de vuelta a entidad Event
  }
}
```

**Patrón de Mapeo:**
- Mantén entidades de dominio separadas de schemas de base de datos
- Crea funciones de mapeo para convertir entre entidad y modelos de base de datos
- La capa de dominio retorna entidades, no registros de BD sin procesar

---

## Calidad del Código y Mejores Prácticas

### Manejo de Errores

- Usa errores tipados con contexto de dominio
- Crea tipos de error personalizados para errores específicos del dominio

```typescript
// ✅ BUENO
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

- Siempre tipifica retornos de Promise explícitamente: `Promise<T>`
- Usa `async/await` en lugar de cadenas `.then()`
- Maneja errores con bloques try/catch
- Nunca dejes promesas sin manejar rechazos

```typescript
// ✅ BUENO
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

- Escribe código autodocumentado; solo comenta POR QUÉ, no QUÉ
- Usa JSDoc para funciones públicas y lógica compleja

```typescript
// ✅ BUENO
/**
 * Calcula el precio del boleto basado en demanda y disponibilidad del evento.
 * Mayor demanda multiplica el precio base (modelo de precios dinámicos).
 * @param basePrice - Precio original del boleto de evento (en centavos)
 * @param demandMultiplier - Factor de demanda (1.0 = base, 1.5 = 50% aumento)
 * @returns Precio ajustado en centavos
 */
export function calculateDynamicPrice(
  basePrice: number,
  demandMultiplier: number
): number {
  return Math.ceil(basePrice * demandMultiplier);
}
```

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
| Importa dominio en infraestructura | Importa interfaces de infraestructura en dominio |
| Usa tipo `any` | Usa `unknown` o tipos explícitos |
| Pon lógica de negocio en rutas | Pon lógica en entidades de dominio y casos de uso |
| Mezcla schema de BD con tipos de entidad | Mapea entre capas limpios |
| Mutación de propiedades de entidad | Usa propiedades readonly, retorna nuevas instancias |
| Manejo de errores inconsistente | Crea errores personalizados tipados |
| Números mágicos hardcodeados inline | Usa constantes nombradas con significado de dominio |
| Test de UI en lugar de lógica principal | Test de dominio, integra con infraestructura |

---

## Nomenclatura de Archivos y Carpetas

```
src/
  core/
    domain/
      entities/
        Event.ts               ← PascalCase, singular
        User.ts
      enums/
        EventStatus.ts         ← PascalCase
    ports/
      IEventRepository.ts      ← Prefijo I o sufijo Port
  infraestructure/
    db/
      eventRepository.ts       ← camelCase, nombre de adaptador
      index.ts                 ← Exportaciones e inicialización
    external/
      googleMapsClient.ts
  presentation/
    components/
      ui/
        Button.tsx             ← PascalCase
      features/
        EventList/
          EventCard.tsx
          EventList.tsx
    app/
      (routes)/
        page.tsx
        layout.tsx
```

---

## Resumen

Sigue estos principios en cada archivo:
1. **Arquitectura**: Respeta límites de capas (dominio → puertos → infraestructura → presentación)
2. **Tipos**: Tipos explícitos siempre; sin `any`; modo estricto habilitado
3. **Componentes**: Funcionales + TypeScript; usa CVA para variantes
4. **Base de Datos**: Separación limpia entre entidades y schemas; usa patrón de repositorio
5. **Errores**: Errores personalizados tipados específicos del dominio
6. **Testing**: Enfocarse en lógica de dominio y rutas críticas
7. **Estilo**: Nombres consistentes, código legible, autodocumentado

Cuando dudes, hace referencia a los patrones de la entidad `Event` e `IEventRepository` en el proyecto—ejemplifican los estándares aplicados aquí.
