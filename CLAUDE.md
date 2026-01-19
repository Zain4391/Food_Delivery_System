# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run start:dev          # Development mode with watch
npm run start              # Standard development mode
npm run start:prod         # Production mode (requires build first)
```

### Database Migrations
```bash
npm run migration:generate src/migrations/MigrationName    # Generate new migration
npm run migration:run                                       # Run pending migrations
npm run migration:revert                                    # Revert last migration
npm run migration:show                                      # Show migration status
```

### Testing
```bash
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage report
npm run test:e2e           # Run end-to-end tests
```

### Code Quality
```bash
npm run format             # Format code with Prettier
npm run lint               # Lint and auto-fix with ESLint
npm run build              # Build for production
```

## Architecture Overview

### Monolithic Event-Driven Design

This is a **monolithic NestJS application** with **event-driven communication between modules** via RabbitMQ. Despite being a monolith, modules communicate asynchronously through events rather than direct service imports for certain workflows.

**Key Architectural Points:**
- REST API for external communication (customers, drivers, admins)
- RabbitMQ events for internal module-to-module communication
- Three microservice listeners within the monolith: Orders, Restaurants, Delivery
- All microservices are initialized in `main.ts` using `app.connectMicroservice()` and started with `app.startAllMicroservices()`

### Module Communication Pattern

**REST → Service → RabbitMQ → Controller → Service → RabbitMQ**

Example flow:
1. Customer creates order (REST API → OrdersService)
2. OrdersService saves to DB and emits `order.placed` event to RabbitMQ
3. RestaurantsController consumes `order.placed` via `@EventPattern('order.placed')`
4. RestaurantsService processes and emits `order.confirmed` event
5. OrdersController consumes `order.confirmed` and updates order status
6. Process continues through delivery workflow

### Event Queue Configuration

Located in `src/rabbitmq/rabbitmq.config.ts`:

```typescript
QUEUE_CONFIGS = {
  ORDERS: {
    queue: 'order-service-queue',
    routingKeys: ['order.confirmed', 'driver.assigned', 'order.delivered']
  },
  RESTAURANTS: {
    queue: 'restaurants-service-queue',
    routingKeys: ['order.placed']
  },
  DELIVERY: {
    queue: 'delivery-service-queue',
    routingKeys: ['order.ready', 'order.picked.up']
  }
}
```

**Important:** Each module connects to RabbitMQ and listens to specific routing keys (events). Controllers use `@EventPattern('event.name')` decorators to consume events.

### Event DTOs

All events extend `BaseEventDTO` (in `src/common/events/base-event.dto.ts`) and are located in `src/events/`:
- `order/` - Order-related events (order.placed)
- `restaurant/` - Restaurant-related events (order.confirmed, order.ready)
- `delivery/` - Delivery-related events (driver.assigned, order.picked.up, order.delivered)

**Event Structure:**
```typescript
class BaseEventDTO {
  eventId: string;      // Auto-generated UUID
  timestamp: string;    // ISO 8601 timestamp
  eventType: string;    // Event type identifier
}
```

### Dual Authentication System

The application has **TWO separate JWT strategies** for different user types:

1. **Customer JWT** (`JWT_CUSTOMER_SECRET`)
   - Strategy: `JwtCustomerStrategy` (jwt-customer.strategy.ts)
   - Guard: `JwtCustomerGuard`
   - Used for customer endpoints

2. **Driver JWT** (`JWT_DRIVER_SECRET`)
   - Strategy: `DriverStrategy` (jwt-driver.strategy.ts)
   - Guard: `JwtDriverGuard`
   - Used for driver endpoints

**Usage:**
- Use `@UseGuards(JwtCustomerGuard)` for customer-protected endpoints
- Use `@UseGuards(JwtDriverGuard)` for driver-protected endpoints
- Use `@Roles(ROLES.ADMIN, ROLES.CUSTOMER)` with `RolesGuard` for role-based access

**Note:** Admin users are stored in the Customer entity with `role: ROLES.ADMIN`.

### Database Configuration

**Two separate database URLs:**
- `DATABASE_URL` - Used by TypeORM in the application runtime (app.module.ts)
- `MIGRATION_URL` - Used by TypeORM CLI for migrations (data-source.ts)

This separation allows different connection strings for migrations vs runtime (useful for local dev vs deployed environments).

**Important:**
- `synchronize: false` in production - use migrations only
- `autoLoadEntities: true` in app.module.ts automatically loads entities
- Entities follow pattern: `**/*.entity.ts`
- Migrations are in `src/migrations/`

### Supabase Integration

**Factory Pattern for Supabase Client:**
The application uses a singleton factory function `getSupabaseClient()` in `src/config/supabase.config.ts` to manage the Supabase client instance. This ensures only one client is created and reused across the application.

**Usage:**
```typescript
import { getSupabaseClient } from 'src/config/supabase.config';
const supabase = getSupabaseClient();
```

**File Upload Pattern:**
- Profile images for customers and drivers
- Restaurant logos and banners
- Menu item images
- All uploads go to Supabase Storage buckets

### Global Exception Handling

The application uses a `GlobalExceptionFilter` (src/common/filter/http-exception.filter.ts) that standardizes all error responses:

```typescript
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2026-01-03T..."
  }
}
```

All HTTP exceptions are automatically caught and formatted consistently.

### API Response Structure

Success responses follow this format (defined in auth/dto/api-response-dto):
```typescript
{
  "statusCode": 200,
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Order Status Flow

Order statuses follow a strict progression defined in the codebase:

```
pending → confirmed → preparing → ready → picked_up → delivered
                ↓
            cancelled (can happen from pending/confirmed/preparing)
```

**Important:** When updating order status, ensure the transition is valid. The delivery workflow is tightly coupled with order status changes through RabbitMQ events.

## Module Structure

### Core Modules
- `auth/` - Authentication with dual JWT strategies (Customer & Driver)
- `users/` - Customer management (also includes Admin role)
- `drivers/` - Delivery driver management
- `resturants/` - Restaurant and menu item management (note: typo in folder name)
- `orders/` - Order processing with event emission/consumption
- `delivery/` - Delivery tracking with event emission/consumption
- `rabbitmq/` - RabbitMQ service and configuration

### Common/Shared
- `common/enums/` - ROLES enum (CUSTOMER, DRIVER, ADMIN)
- `common/exceptions/` - Custom exception classes
- `common/filter/` - GlobalExceptionFilter
- `common/pipes/` - Validation pipes
- `common/events/` - BaseEventDTO

### Configuration
- `config/database.config.ts` - Database configuration
- `config/jwt.constants.ts` - JWT secrets for Customer and Driver
- `config/supabase.config.ts` - Supabase client factory

## Key Development Patterns

### Adding a New Event

1. Create event DTO in `src/events/[module]/` extending `BaseEventDTO`
2. Add routing key to appropriate queue in `QUEUE_CONFIGS` (rabbitmq.config.ts)
3. Emit event using `RabbitMQService.emit(routingKey, eventData)`
4. Consume event with `@EventPattern('routing.key')` in controller
5. Add manual acknowledgment: `context.getChannelRef().ack(context.getMessage())`

### Adding Protected Endpoints

**For Customer endpoints:**
```typescript
@UseGuards(JwtCustomerGuard, RolesGuard)
@Roles(ROLES.CUSTOMER, ROLES.ADMIN)
```

**For Driver endpoints:**
```typescript
@UseGuards(JwtDriverGuard, RolesGuard)
@Roles(ROLES.DRIVER)
```

**Access current user:**
```typescript
@CurrentUser() user: Customer  // or DeliveryDriver
```

### File Upload Pattern

Use Supabase Storage through the factory:
```typescript
const supabase = getSupabaseClient();
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(path, file);
```

### Environment Variables Required

```
DATABASE_URL, MIGRATION_URL, DB_SSL
JWT_SECRET, JWT_CUSTOMER_SECRET, JWT_DRIVER_SECRET
SUPABASE_URL, SUPABASE_ANON_KEY
RABBITMQ_URL, RABBITMQ_QUEUE
NODE_ENV
```

## Testing Notes

- Unit test files: `*.spec.ts` alongside source files
- E2E tests: `test/` directory with `jest-e2e.json` config
- Coverage reports: Generated in `coverage/` directory
- Test environment: Node.js (configured in package.json jest config)
