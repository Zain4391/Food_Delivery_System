# Food Delivery Application

A modern food delivery platform built with NestJS, TypeScript, TypeORM, and PostgreSQL. This application manages customers, restaurants, menu items, orders, deliveries, and delivery drivers.

## Description

This is a full-featured food delivery backend system built with [NestJS](https://github.com/nestjs/nest) framework. It provides RESTful APIs for managing the entire food delivery workflow from ordering to delivery tracking.

## Features

- 👥 **Customer Management** - User registration, authentication, profile management, and order history
- 🍽️ **Restaurant Management** - Restaurant profiles, menu management, and availability control
- 📋 **Menu Items** - Categorized food items with pricing, images, and real-time availability
- 🛒 **Order Processing** - Complete order lifecycle from placement to delivery with status tracking
- 🚚 **Delivery Tracking** - Real-time delivery status updates and timestamp tracking
- 🏍️ **Driver Management** - Delivery driver profiles, vehicle management, and availability toggle
- 🔐 **Authentication** - Role-based JWT authentication (Customer, Driver, Admin)
- 📁 **File Upload** - Profile images, menu item images, restaurant logos and banners via Supabase Storage
- 🐰 **Event-Driven** - RabbitMQ integration for asynchronous messaging
- 🎯 **Consistent API Responses** - Standardized success and error response structures

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** TypeORM
- **Authentication:** JWT, Passport (Customer & Driver strategies)
- **Message Queue:** RabbitMQ
- **File Storage:** Supabase Storage
- **Validation:** class-validator, class-transformer
- **Code Quality:** ESLint, Prettier

## Database Schema

The application includes the following entities:

- **Customers** - User accounts and profiles
- **Restaurants** - Restaurant information and locations
- **Menu Items** - Food items with categories (appetizer, main, dessert, beverage)
- **Orders** - Order details with status tracking (pending, confirmed, preparing, ready, picked_up, delivered, cancelled)
- **Order Items** - Individual items within an order
- **Delivery Drivers** - Driver profiles with vehicle information
- **Deliveries** - Delivery tracking and status

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)
- RabbitMQ server (optional, for event-driven features)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
MIGRATION_URL=postgresql://username:password@host:port/database
DB_SSL=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_CUSTOMER_SECRET=your-customer-jwt-secret
JWT_DRIVER_SECRET=your-driver-jwt-secret

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=main_queue

# Environment
NODE_ENV=development
```

## Project setup

```bash
# Install dependencies
$ npm install
```

## Database Migrations

```bash
# Generate a new migration
$ npm run migration:generate src/migrations/MigrationName

# Run migrations
$ npm run migration:run

# Revert last migration
$ npm run migration:revert
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Authentication
- `POST /auth/register/customer` - Register a new customer
- `POST /auth/register/driver` - Register a new driver
- `POST /auth/login/customer` - Customer login
- `POST /auth/login/driver` - Driver login

### Customer Management
- `GET /customer/profile` - Get customer profile (Customer)
- `GET /customer/all` - Get all customers with pagination (Admin)
- `GET /customer/:id` - Get customer by ID (Admin)
- `GET /customer/:email` - Get customer by email (Admin)
- `GET /customer/orders/:id` - Get customer orders (Customer/Admin)
- `PUT /customer/update/:id` - Update customer profile (Customer)
- `PUT /customer/update-password/:id` - Update customer password (Customer)
- `POST /customer/forgot-password` - Reset customer password
- `POST /customer/upload-profile-image/:id` - Upload profile image (Customer)
- `DELETE /customer/delete/:id` - Delete customer (Admin)

### Driver Management
- `GET /driver/profile` - Get driver profile (Driver)
- `GET /driver/all` - Get all drivers with pagination (Admin)
- `GET /driver/:id` - Get driver by ID (Admin)
- `GET /driver/:email` - Get driver by email (Admin)
- `GET /driver/orders/delivered/:id` - Get delivered orders (Driver/Admin)
- `GET /driver/orders/pending/:id` - Get pending orders (Driver/Admin)
- `GET /driver/orders/all/:id` - Get all driver orders (Driver/Admin)
- `PUT /driver/update/:id` - Update driver profile (Driver)
- `PUT /driver/update-password/:id` - Update driver password (Driver)
- `POST /driver/forgot-password` - Reset driver password
- `POST /driver/upload-profile-image/:id` - Upload profile image (Driver)
- `PATCH /driver/change-vehicle/:id` - Change vehicle type (Driver)
- `PATCH /driver/toggle-availability/:id` - Toggle availability status (Driver)
- `DELETE /driver/delete/:id` - Delete driver (Admin)

### Restaurant Management
- `GET /restaurant/all` - Get all restaurants with filtering
- `GET /restaurant/:id` - Get restaurant by ID
- `POST /restaurant/create` - Create new restaurant (Admin)
- `PUT /restaurant/update/:id` - Update restaurant (Admin)
- `DELETE /restaurant/delete/:id` - Delete restaurant (Admin)
- `PATCH /restaurant/toggle-active/:id` - Toggle restaurant active status (Admin)
- `POST /restaurant/upload-logo/:id` - Upload restaurant logo (Admin)
- `POST /restaurant/upload-banner/:id` - Upload restaurant banner (Admin)

### Menu Items
- `GET /restaurant/:restaurantId/menu/all` - Get all menu items for restaurant
- `GET /restaurant/:restaurantId/menu/available` - Get available menu items
- `GET /restaurant/menu/item/:id` - Get menu item by ID
- `POST /restaurant/:restaurantId/menu/create` - Create menu item (Admin)
- `PUT /restaurant/menu/update/:id` - Update menu item (Admin)
- `DELETE /restaurant/menu/delete/:id` - Delete menu item (Admin)
- `PATCH /restaurant/menu/toggle-availability/:id` - Toggle item availability (Admin)
- `POST /restaurant/menu/upload-image/:id` - Upload menu item image (Admin)

### Order Management
- `GET /order/all` - Get all orders (Admin)
- `GET /order/:id` - Get order by ID (Customer/Admin)
- `POST /order/create` - Create new order (Customer)
- `PUT /order/update/:id` - Update order (Admin)
- `PATCH /order/update-status/:id` - Update order status (Admin)
- `PATCH /order/assign-driver/:orderId` - Assign driver to order (Admin)
- `PATCH /order/cancel/:id` - Cancel order (Customer)
- `DELETE /order/delete/:id` - Delete order (Admin)
- `GET /order/customer/:customerId` - Get orders by customer (Customer/Admin)
- `GET /order/restaurant/:restaurantId` - Get orders by restaurant (Admin)
- `GET /order/driver/:driverId` - Get orders by driver (Driver/Admin)

### Delivery Management
- `GET /delivery/all` - Get all deliveries with pagination (Admin)
- `GET /delivery/:id` - Get delivery by ID (Driver/Admin)
- `GET /delivery/order/:orderId` - Get delivery by order ID (Driver/Admin)
- `POST /delivery/create` - Create new delivery (Admin)
- `PUT /delivery/update/:id` - Update delivery (Admin)
- `PATCH /delivery/mark-picked-up/:id` - Mark delivery as picked up (Driver)
- `PATCH /delivery/mark-delivered/:id` - Mark delivery as delivered (Driver)
- `DELETE /delivery/delete/:id` - Delete delivery (Admin)

## Project Structure

```
src/
├── auth/
│   ├── decorators/        # Custom decorators (CurrentUser, Roles)
│   ├── dto/               # DTOs and response structures
│   ├── guards/            # Auth guards (Customer, Driver, Roles)
│   ├── strategy/          # JWT strategies
│   └── types/             # Type definitions
├── common/                 # Shared modules
│   ├── enums/             # Role enums
│   ├── exceptions/        # Custom exception classes
│   ├── filter/            # Exception filters
│   └── pipes/             # Validation pipes
├── config/                 # Configuration files
│   ├── database.config.ts
│   ├── jwt.constants.ts
│   └── supabase.config.ts
├── delivery/               # Delivery management
│   ├── dtos/
│   ├── entities/
│   ├── delivery.controller.ts
│   └── delivery.service.ts
├── drivers/                # Delivery drivers
│   ├── dtos/
│   ├── entities/
│   ├── driver.controller.ts
│   └── driver.service.ts
├── migrations/             # TypeORM migrations
├── orders/                 # Order management
│   ├── dto/
│   ├── entities/
│   ├── order.controller.ts
│   └── order.service.ts
├── rabbitmq/               # RabbitMQ integration
│   ├── rabbitmq.module.ts
│   └── rabbitmq.service.ts
├── resturants/             # Restaurant & menu management
│   ├── dto/
│   ├── entities/
│   ├── restaurant.controller.ts
│   └── restaurant.service.tsPOST /restaurant/menu/upload-image/:id` - Upload menu item image (Admin)

### Order Management
- `GET /order/all` - Get all orders (Admin)
- `GET /order/:id` - Get order by ID (Customer/Admin)
- `POST /order/create` - Create new order (Customer)
- `PUT /order/update/:id` - Update order (Admin)
- `PATCH /order/update-status/:id` - Update order status (Admin)
- `PATCH /order/assign-driver/:orderId` - Assign driver to order (Admin)
- `PATCH /order/cancel/:id` - Cancel order (Customer)
- `DELETE /order/delete/:id` - Delete order (Admin)
- `GET /order/customer/:customerId` - Get orders by customer (Customer/Admin)
- `GET /order/restaurant/:restaurantId` - Get orders by restaurant (Admin)
- `GET /order/driver/:driverId` - Get orders by driver (Driver/Admin)

### Delivery Management
- `GET /delivery/all` - Get all deliveries with pagination (Admin)
- `GET /delivery/:id` - Get delivery by ID (Driver/Admin)
- `GET /delivery/order/:orderId` - Get delivery by order ID (Driver/Admin)
- `POST /delivery/create` - Create new delivery (Admin)
- `PUT /delivery/update/:id` - Update delivery (Admin)
- `PATCH /delivery/mark-picked-up/:id` - Mark delivery as picked up (Driver)
- `PATCH /delivery/mark-delivered/:id` - Mark delivery as delivered (Driver)
- `DELETE /delivery/delete/:id` - Delete delivery (Admin)
### Restaurants
- `POST /restaurants` - Create a new restaurant
- `GET /restaurants` - Get all restaurants
- `GET /restaurants/:id` - Get restaurant by ID
- `PATCH /restaurants/:id` - Update restaurant
- `DELETE /restaurants/:id` - Delete restaurant

## Project Structure

```
src/
├── auth/               # Authentication module
├── config/             # Configuration files
│   └── database.config.ts
├── delivery/           # Delivery management
│   └── entities/
├── drivers/            # Delivery drivers
│   └── entities/
├── migrations/         # TypeORM migrations
├── orders/             # Order management
│   └── entities/
├── resturants/         # Restaurant & menu management
│   └── entities/
├── users/              # User/Customer management
│   └── entities/
├── app.module.ts       # Root module
├── main.ts             # Application entry point
└── data-source.ts      # TypeORM configuration
```

## Code Formatting

```bash
# Format code with Prettier
$ npm run format

# Lint and fix code
$ npm run lint
```

## Deployment

When you're ready to deploy your application to production:

1. Set `NODE_ENV=production` in your environment variables
2. Configure SSL for database connections
3. Use a process manager like PM2 for production
4. Set up proper logging and monitoring

```bash
# Build the application
$ npm run build

# Run in production mode
$ npm run start:prod
```

For more information, check out the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the UNLICENSED license.
