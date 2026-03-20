# Food Delivery Application — Backend

A full-featured food delivery backend built with NestJS, TypeScript, TypeORM, and PostgreSQL. Discovered and fixed while building the frontend in March 2026 — see the [Bug Fixes & Lessons Learned](#bug-fixes--lessons-learned) section.

---

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** TypeORM
- **Authentication:** JWT, Passport (separate strategies for Customer, Driver, Admin)
- **Message Queue:** RabbitMQ
- **File Storage:** Supabase Storage
- **Validation:** class-validator, class-transformer

---

## Features

- 👥 **Customer Management** — registration, auth, profile, order history
- 🍽️ **Restaurant Management** — profiles, menus, availability
- 📋 **Menu Items** — categories, pricing, images, availability toggle
- 🛒 **Order Processing** — full lifecycle with status tracking
- 🚚 **Delivery Tracking** — real-time status, timestamps
- 🏍️ **Driver Management** — profiles, vehicle management, availability toggle
- 🔐 **Auth** — role-based JWT (Customer / Driver / Admin) with separate secrets
- 📁 **File Upload** — profile images, menu images, restaurant logos via Supabase Storage
- 🐰 **Event-Driven** — RabbitMQ for async order → restaurant → delivery flow

---

## Prerequisites

- Node.js v18+
- PostgreSQL (or Supabase account)
- RabbitMQ (optional — needed for the event-driven order flow)

---

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database
MIGRATION_URL=postgresql://username:password@host:port/database
DB_SSL=false

# JWT — three separate secrets, one per role
JWT_SECRET=your-super-secret-jwt-key
JWT_CUSTOMER_SECRET=your-customer-jwt-secret
JWT_DRIVER_SECRET=your-driver-jwt-secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=main_queue

NODE_ENV=development
```

---

## Setup

```bash
npm install

# Run migrations
npm run migration:run

# Development
npm run start:dev

# Production
npm run build && npm run start:prod
```

---

## API Endpoints

### Authentication
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/customer/register` | Public | Register customer |
| POST | `/api/auth/driver/register` | Public | Register driver |
| POST | `/api/auth/admin/register` | Public | Register admin |
| POST | `/api/auth/customer/login` | Public | Customer login |
| POST | `/api/auth/driver/login` | Public | Driver login |
| POST | `/api/auth/admin/login` | Public | Admin login |

### Customer Management
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/customer/profile` | Customer | Own profile (from JWT strategy) |
| GET | `/customer/admin/profile` | Admin | Admin's own profile (from JWT strategy) |
| GET | `/customer/all` | Admin | All customers (paginated) |
| GET | `/customer/:id` | Admin | Customer by ID |
| GET | `/customer/email/:email` | Admin | Customer by email |
| GET | `/customer/admin/orders/:id` | Customer | Own orders — **note: prefixed with admin/ historically** |
| GET | `/customer/orders/:id` | Admin | Customer orders (admin view) |
| PUT | `/customer/update/:id` | Customer | Update own profile |
| PUT | `/customer/update-password/:id` | Customer | Change password |
| PUT | `/customer/admin/update/:id` | Admin | Admin updates own profile |
| PUT | `/customer/admin/update-password/:id` | Admin | Admin changes own password |
| POST | `/customer/upload-profile-image/:id` | Customer | Upload profile picture |
| POST | `/customer/admin/upload-profile-image/:id` | Admin | Admin uploads profile picture |
| POST | `/customer/forgot-password` | Public | Reset password |
| DELETE | `/customer/delete/:id` | Admin | Delete customer |

### Driver Management
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/driver/profile` | Driver | Own profile (from JWT strategy) |
| GET | `/driver/all` | Admin | All drivers (paginated) |
| GET | `/driver/:id` | Admin | Driver by ID |
| GET | `/driver/orders/all/:id` | Driver | Own all orders |
| GET | `/driver/orders/delivered/:id` | Driver | Delivered orders |
| GET | `/driver/orders/pending/:id` | Driver | Pending orders |
| GET | `/driver/admin/orders/all/:id` | Admin | Driver orders (admin view) |
| PUT | `/driver/update/:id` | Driver | Update own profile |
| PUT | `/driver/update-password/:id` | Driver | Change password |
| POST | `/driver/upload-profile-image/:id` | Driver | Upload profile picture |
| POST | `/driver/forgot-password` | Public | Reset password |
| PATCH | `/driver/change-vehicle/:id` | Driver | Change vehicle type |
| PATCH | `/driver/toggle-availability/:id` | Driver | Toggle availability |
| DELETE | `/driver/delete/:id` | Admin | Delete driver |

### Restaurant Management
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/restaurant/all` | Public | All restaurants (paginated/filtered) |
| GET | `/restaurant/:id` | Public | Restaurant by ID |
| POST | `/restaurant/create` | Admin | Create restaurant |
| PUT | `/restaurant/update/:id` | Admin | Update restaurant |
| DELETE | `/restaurant/delete/:id` | Admin | Delete restaurant |
| PATCH | `/restaurant/toggle-active/:id` | Admin | Toggle active status |
| POST | `/restaurant/upload-logo/:id` | Admin | Upload logo |
| POST | `/restaurant/upload-banner/:id` | Admin | Upload banner |

### Menu Items
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/restaurant/:id/menu/all` | Public | All menu items for restaurant |
| GET | `/restaurant/:id/menu/available` | Public | Available menu items |
| GET | `/restaurant/menu/item/:id` | Public | Menu item by ID |
| POST | `/restaurant/:id/menu/create` | Admin | Create menu item |
| PUT | `/restaurant/menu/update/:id` | Admin | Update menu item |
| DELETE | `/restaurant/menu/delete/:id` | Admin | Delete menu item |
| PATCH | `/restaurant/menu/toggle-availability/:id` | Admin | Toggle availability |
| POST | `/restaurant/menu/upload-image/:id` | Admin | Upload item image |

### Order Management
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/order/all` | Admin | All orders (paginated) |
| GET | `/order/:id` | Customer/Admin | Order by ID |
| GET | `/order/customer/:customerId` | Customer/Admin | Orders by customer |
| GET | `/order/restaurant/:restaurantId` | Admin | Orders by restaurant |
| GET | `/order/driver/:driverId` | Driver/Admin | Orders by driver |
| POST | `/order/create` | Customer | Create order |
| PUT | `/order/update/:id` | Admin | Update order |
| PATCH | `/order/update-status/:id` | Admin | Advance order status |
| PATCH | `/order/assign-driver/:orderId` | Admin | Assign driver |
| PATCH | `/order/cancel/:id` | Customer | Cancel order |
| DELETE | `/order/delete/:id` | Admin | Delete order |

### Delivery Management
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/delivery/all` | Admin | All deliveries (paginated) |
| GET | `/delivery/:id` | Driver/Admin | Delivery by ID |
| GET | `/delivery/order/:orderId` | Driver/Admin | Delivery by order ID |
| POST | `/delivery/create` | Admin | Create delivery |
| PUT | `/delivery/update/:id` | Admin | Update delivery |
| PATCH | `/delivery/mark-picked-up/:id` | Driver | Mark picked up |
| PATCH | `/delivery/mark-delivered/:id` | Driver | Mark delivered |
| DELETE | `/delivery/delete/:id` | Admin | Delete delivery |

---

## API Response Format

```json
// Success
{ "statusCode": 200, "success": true, "data": {}, "message": "..." }

// Error
{ "success": false, "error": { "message": "...", "statusCode": 400, "timestamp": "..." } }
```

All list endpoints use `nestjs-typeorm-paginate` and return:

```json
{ "items": [...], "meta": { "totalItems": 50, "currentPage": 1, "itemsPerPage": 10, "totalPages": 5 }, "links": {} }
```

---

## Order Status Flow

```
pending → confirmed → preparing → ready → picked_up → delivered
                                                      ↑ cancelled (from pending/confirmed/preparing)
```

---

## Roles & Permissions

| Role | Can do |
|------|--------|
| CUSTOMER | Create orders, view own orders, manage own profile |
| DRIVER | View/accept deliveries, toggle availability, manage own profile |
| ADMIN | Full access to all resources, manage customers and drivers |

---

## Project Structure

```
src/
├── auth/
│   ├── decorators/        # @CurrentUser, @Roles
│   ├── dto/               # Response DTOs (CustomerResponseDTO, DriverResponseDTO)
│   ├── guards/            # JwtCustomerGuard, JwtDriverGuard, JwtAdminGuard, RolesGuard
│   ├── strategy/          # jwt-customer, jwt-driver, jwt-admin strategies
│   └── types/             # AuthenticatedUser, JwtPayload interfaces
├── common/
│   ├── enums/             # ROLES enum
│   ├── exceptions/        # Custom exception classes
│   ├── filter/            # GlobalExceptionFilter
│   └── pipes/             # UuidValidationPipe
├── config/
├── delivery/
├── drivers/
├── migrations/
├── orders/
├── rabbitmq/
├── resturants/
├── users/
├── events/
├── app.module.ts
└── main.ts
```

---

## Bug Fixes & Lessons Learned

> These bugs were discovered in March 2026 when building the frontend against this backend. The backend was originally written in December 2025 without thorough integration testing. **Lesson: write unit + integration tests as you go — don't test via the frontend six weeks later.**

### Bug 1 — Wrong auth endpoint URL pattern

**File:** `src/auth/auth.controller.ts`  
**Problem:** Auth routes were registered as `/auth/register/customer`, `/auth/login/customer` etc., but the controller had `@Controller('api/auth')` making the actual paths `/api/auth/customer/login`.  
**Fix:** Frontend service URLs corrected to match the actual backend routing.

---

### Bug 2 — Wrong order service URLs on the frontend (but root cause was undocumented)

**Files:** `services/order.service.ts`, `services/customer.service.ts` (frontend)  
**Problem:** Frontend was calling `/order/admin/customer/:id`, `/order/admin/driver/:id`, and `/customer/admin/orders/:id`. None of these paths exist. The actual endpoints are `/order/customer/:id`, `/order/driver/:id`, and `/customer/orders/:id`. The README did not clearly document the full path for every endpoint, leading to guesswork.  
**Fix:** Corrected all URLs. Root cause: endpoint paths weren't fully documented with their guards, so it was unclear which prefix applied to which role.

---

### Bug 3 — `PaginatedResponse` shape mismatch

**Files:** `src/users/user.service.ts`, `src/drivers/driver.service.ts`  
**Problem:** Frontend `PaginatedResponse<T>` type expected `{ data: T[], total: number }` (a custom shape). The backend uses `nestjs-typeorm-paginate` which returns `{ items: T[], meta: { totalItems, currentPage, ... }, links }`. Every paginated list rendered as empty because `data?.data` and `data?.total` were always `undefined`.  
**Fix:** Frontend `PaginatedResponse<T>` type updated to match the actual library output. All pages updated to use `.items` and `.meta.totalItems`.  
**Also fixed:** A typo in `user.service.ts` search query — `%${search}}%` (extra `}`) meant every search returned 0 results.

---

### Bug 4 — No admin self-update/password endpoints existed

**File:** `src/users/user.controller.ts`  
**Problem:** `PUT /customer/update/:id` and `PUT /customer/update-password/:id` are guarded by `JwtCustomerGuard` + `CUSTOMER` role. Admin is not a customer — calling these returned 403. There were no equivalent admin-guarded update routes.  
**Fix:** Added:
- `PUT /customer/admin/update/:id` — `JwtAdminGuard` + `ADMIN`
- `PUT /customer/admin/update-password/:id` — `JwtAdminGuard` + `ADMIN`
- `POST /customer/admin/upload-profile-image/:id` — `JwtAdminGuard` + `ADMIN`

All three reuse the existing service methods — no service changes needed.

---

### Bug 5 — Profile image field name mismatch between entity and DTO

**Files:** `src/auth/dto/customer-response-dto.ts`, `src/auth/dto/driver-response-dto.ts`  
**Problem:** The DB entity columns are named `profile_image_url`. The DTOs declared a property called `profile_img_url`. The DTO constructors do `Object.assign(this, partial)` where `partial` is the entity — `Object.assign` copies `profile_image_url` as-is, so the DTO's `profile_img_url` field remained `undefined`. The API never returned the profile picture URL even when it was stored in the database.  
**Fix:** Added explicit mapping in both constructors:

```ts
constructor(partial: Partial<CustomerResponseDTO> & { profile_image_url?: string }) {
    super(partial);
    Object.assign(this, partial);
    if (partial.profile_image_url !== undefined) {
        this.profile_img_url = partial.profile_image_url;
    }
}
```

---

### Bug 6 — Profile endpoints return JWT payload, not DB record (missing `profile_img_url`)

**Files:** `src/auth/strategy/jwt-customer.strategy.ts`, `jwt-admin.strategy.ts`, `jwt-driver.strategy.ts`  
**Problem:** `GET /customer/profile`, `GET /customer/admin/profile`, `GET /driver/profile` all return `@CurrentUser()` — which is the `AuthenticatedUser` object built by each strategy's `validate()` method. Each strategy already does a fresh DB query per request but only mapped `id`, `email`, `name`, `role`, `userType` — silently dropping `profile_image_url`.  
**Fix:** Added `profile_img_url` to `AuthenticatedUser` interface and mapped it in all three strategies:

```ts
return {
  id: customer.id,
  email: customer.email,
  name: customer.name,
  role: customer.role,
  userType: 'customer',
  profile_img_url: customer.profile_image_url ?? undefined,
};
```

---

### Bug 7 — `GlobalExceptionFilter` crashes on non-HttpException errors

**File:** `src/common/filter/http-exception.filter.ts`  
**Problem:** The filter is decorated `@Catch()` (catches everything) but typed `catch(exception: HttpException, ...)` and called `exception.getStatus()` unconditionally on the first line. When a plain `TypeError` or runtime error was thrown, `.getStatus()` doesn't exist → `TypeError: exception.getStatus is not a function` → the filter itself crashed and NestJS couldn't send an error response.  
**Fix:** Changed parameter to `exception: unknown`, added `instanceof HttpException` check before calling any HttpException methods, defaulted status to `HttpStatus.INTERNAL_SERVER_ERROR` for all other errors.

```ts
catch(exception: unknown, host: ArgumentsHost) {
  if (exception instanceof HttpException) {
    status = exception.getStatus();
    ...
  } else if (exception instanceof Error) {
    message = exception.message;
    this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
  }
```

---

### Bug 8 — Driver JWT strategy imported `JwtPayload` from `@supabase/supabase-js`

**File:** `src/auth/strategy/jwt-driver.strategy.ts`  
**Problem:** `import { JwtPayload } from '@supabase/supabase-js'` — used Supabase's JWT payload type instead of the local `auth.types.ts` definition. Worked by accident (same field names) but was a latent type safety issue.  
**Fix:** Import corrected to local `auth.types.ts`.

---

## Event-Driven Architecture

RabbitMQ topic exchange connects three services asynchronously:

```
Customer places order
  → OrderService emits order.placed
    → RestaurantService confirms → emits order.confirmed
      → OrderService updates status
        → RestaurantService emits order.ready
          → DeliveryService assigns driver → emits driver.assigned
            → Driver picks up → emits order.picked.up
              → Driver delivers → emits order.delivered
                → OrderService marks delivered, driver set available
```

---

## Contributing

Contributions welcome. Please add unit and integration tests for any new endpoints before submitting a PR.

## License

UNLICENSED
