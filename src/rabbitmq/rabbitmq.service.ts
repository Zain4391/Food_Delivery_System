import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private clients: Map<string, ClientProxy> = new Map();
    private eventQueueMap: Record<string, string> = {};

    constructor(private configService: ConfigService) {
        const url = this.configService.getOrThrow<string>('RABBITMQ_URL');

        const ordersQueue      = this.configService.get('RABBITMQ_ORDERS_QUEUE')      || 'order-service-queue';
        const restaurantsQueue = this.configService.get('RABBITMQ_RESTAURANTS_QUEUE') || 'restaurants-service-queue';
        const deliveryQueue    = this.configService.get('RABBITMQ_DELIVERY_QUEUE')    || 'delivery-service-queue';

        // Build the event -> queue routing map using resolved config values
        this.eventQueueMap = {
            'order.placed':    restaurantsQueue,
            'order.confirmed': ordersQueue,
            'order.ready':     deliveryQueue,
            'driver.assigned': ordersQueue,
            'order.picked.up': deliveryQueue,
            'order.delivered': ordersQueue,
        };

        // Create one client per queue
        for (const queue of [ordersQueue, restaurantsQueue, deliveryQueue]) {
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
        const queue = this.eventQueueMap[routingKey];
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
