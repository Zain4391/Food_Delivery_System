import { MicroserviceOptions, RmqOptions, Transport } from "@nestjs/microservices";

interface QueueConfig {
    queue: string;
    routingKeys: string[]
}

export function getRabbitMQConfig(config: QueueConfig): MicroserviceOptions {

    return {
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL as string],
            queue: config.queue,
            noAck: false, // Manual acks
            queueOptions: {
                durable: true,
                arguments: {
                    'x-message-ttl': 86400000 // 24 hr message TTL
                }
            },

            exchange: process.env.RABBITMQ_EXCHANGE as string,
            exchangeType: 'topic',
            routingKey: config.routingKeys
        }
    } as unknown as RmqOptions;
}


// Config for each listener
// routingKeys = Events
export const QUEUE_CONFIGS = {
    ORDERS: {
        queue: process.env.RABBITMQ_ORDERS_QUEUE || 'order-service-queue',
        routingKeys: [
            'order.confirmed',
            'driver.assigned',
            'order.delivered'
        ]
    },
    RESTAURANTS: {
        queue: process.env.RABBITMQ_RESTAURANTS_QUEUE || 'restaurants-service-queue',
        routingKeys: [
            'order.placed'
        ]
    },
    DELIVERY: {
        queue: process.env.RABBITMQ_DELIVERY_QUEUE || 'delivery-service-queue',
        routingKeys: [
            'order.ready',
            'order.picked.up'
        ]
    }
}