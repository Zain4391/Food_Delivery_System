import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport, RmqOptions } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    const options: RmqOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.getOrThrow<string>('RABBITMQ_URL')],
        exchange: this.configService.getOrThrow<string>('RABBITMQ_EXCHANGE'),
        exchangeType: 'topic',
        queueOptions: {
          durable: true,
        },
      },
    };

    this.client = ClientProxyFactory.create(options);
  }

  async onModuleInit() {
    await this.client.connect();
    console.log('RabbitMQ Publisher connected');
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  emitEvent(routingKey: string, data: any) {
    this.client.emit(routingKey, data);
    console.log(`Event emitted [${routingKey}]:`, data);
  }
}