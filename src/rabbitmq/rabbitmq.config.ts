import { MicroserviceOptions, Transport } from '@nestjs/microservices';

export function getRabbitMQConfig(queue: string): MicroserviceOptions {
    return {
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL as string],
            queue,
            noAck: false,
            queueOptions: {
                durable: true,
            },
        },
    };
}

export const QUEUE_CONFIGS = {
    ORDERS:      process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',
    RESTAURANTS: process.env.RABBITMQ_RESTAURANTS_QUEUE || 'restaurants-service-queue',
    DELIVERY:    process.env.RABBITMQ_DELIVERY_QUEUE    || 'delivery-service-queue',
};
