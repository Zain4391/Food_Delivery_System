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
        queue: this.configService.get<string>('RABBITMQ_QUEUE'),
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

  emitEvent(pattern: string, data: any): void {
    this.client.emit(pattern, data);
    console.log(`Event emitted: ${pattern}`, data);
  }
}