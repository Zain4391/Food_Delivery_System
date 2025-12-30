# Food Delivery Application

A modern food delivery platform built with NestJS, TypeScript, TypeORM, and PostgreSQL. This application manages customers, restaurants, menu items, orders, deliveries, and delivery drivers.

## Description

This is a full-featured food delivery backend system built with [NestJS](https://github.com/nestjs/nest) framework. It provides RESTful APIs for managing the entire food delivery workflow from ordering to delivery tracking.

## Features

- 👥 **Customer Management** - User registration, authentication, and profile management
- 🍽️ **Restaurant Management** - Restaurant profiles and menu management
- 📋 **Menu Items** - Categorized food items with pricing and availability
- 🛒 **Order Processing** - Complete order lifecycle from placement to delivery
- 🚚 **Delivery Tracking** - Real-time delivery status and driver assignment
- 🏍️ **Driver Management** - Delivery driver profiles and vehicle information
- 🔐 **Authentication** - JWT-based authentication and authorization
- 🐰 **Event-Driven** - RabbitMQ integration for asynchronous messaging

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** TypeORM
- **Authentication:** JWT, Passport
- **Message Queue:** RabbitMQ
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
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile

### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `PATCH /orders/:id` - Update order status
- `DELETE /orders/:id` - Cancel order

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
