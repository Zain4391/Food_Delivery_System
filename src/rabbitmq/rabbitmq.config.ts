import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export function getRabbitMQConfig(queue: string, routingKey: string): MicroserviceOptions {
    return {
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL as string],
            queue,
            noAck: false,
            exchange: process.env.RABBITMQ_EXCHANGE as string,
            exchangeType: 'topic',
            routingKey,                  // single string — amqplib requirement
            queueOptions: {
                durable: true,
                arguments: {
                    'x-message-ttl': 86400000,
                },
            },
        },
    };
}

// One entry per (queue, routingKey) pair — amqplib only accepts a single string
export const MICROSERVICE_CONFIGS: Array<{ queue: string; routingKey: string }> = [
    // Order service listeners
    { queue: process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',       routingKey: 'order.confirmed' },
    { queue: process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',       routingKey: 'driver.assigned' },
    { queue: process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',       routingKey: 'order.delivered' },
    // Restaurant service listeners
    { queue: process.env.RABBITMQ_RESTAURANTS_QUEUE || 'restaurants-service-queue', routingKey: 'order.placed' },
    // Delivery service listeners
    { queue: process.env.RABBITMQ_DELIVERY_QUEUE    || 'delivery-service-queue',    routingKey: 'order.ready' },
    { queue: process.env.RABBITMQ_DELIVERY_QUEUE    || 'delivery-service-queue',    routingKey: 'order.picked.up' },
];
