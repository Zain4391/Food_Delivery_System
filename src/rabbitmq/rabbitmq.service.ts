import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

// Route each event pattern to the queue whose microservice listener
// has the matching @EventPattern() decorator.
const EVENT_QUEUE_MAP: Record<string, string> = {
    'order.placed':   process.env.RABBITMQ_RESTAURANTS_QUEUE || 'restaurants-service-queue',
    'order.confirmed':process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',
    'order.ready':    process.env.RABBITMQ_DELIVERY_QUEUE    || 'delivery-service-queue',
    'driver.assigned':process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',
    'order.picked.up':process.env.RABBITMQ_DELIVERY_QUEUE    || 'delivery-service-queue',
    'order.delivered':process.env.RABBITMQ_ORDERS_QUEUE      || 'order-service-queue',
};

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private clients: Map<string, ClientProxy> = new Map();

    constructor(private configService: ConfigService) {
        const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
        const queues = [
            this.configService.get('RABBITMQ_ORDERS_QUEUE')      || 'order-service-queue',
            this.configService.get('RABBITMQ_RESTAURANTS_QUEUE') || 'restaurants-service-queue',
            this.configService.get('RABBITMQ_DELIVERY_QUEUE')    || 'delivery-service-queue',
        ];

        for (const queue of queues) {
            const client = ClientProxyFactory.create({
                transport: Transport.RMQ,
                options: {
                    urls: [url],
                    queue,
                    queueOptions: { durable: true },
                },
            });
            this.clients.set(queue, client);
        }
    }

    async onModuleInit() {
        for (const client of this.clients.values()) {
            await client.connect();
        }
        console.log('RabbitMQ Publisher connected');
    }

    async onModuleDestroy() {
        for (const client of this.clients.values()) {
            await client.close();
        }
    }

    emitEvent(routingKey: string, data: unknown) {
        const queue = EVENT_QUEUE_MAP[routingKey];
        if (!queue) {
            console.warn(`No queue mapped for event: ${routingKey}`);
            return;
        }
        const client = this.clients.get(queue);
        if (!client) {
            console.warn(`No client found for queue: ${queue}`);
            return;
        }
        client.emit(routingKey, data);
        console.log(`Event emitted [${routingKey}] -> queue [${queue}]`);
    }
}
