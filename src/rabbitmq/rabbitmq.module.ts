import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { RabbitMQService } from "./rabbitmq.service";

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: "RABBITMQ_SERVICE",
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,  // lowercase 'transport', not 'Transport'
                    options: {
                        urls: [configService.getOrThrow<string>('RABBITMQ_URL')],  // Fixed typo: RABBIT_URL -> RABBITMQ_URL
                        queue: configService.getOrThrow<string>('RABBITMQ_QUEUE'),  // Use getOrThrow for consistency
                        queueOptions: {
                            durable: true
                        }
                    }
                }),
                inject: [ConfigService]
            }
        ])
    ],
    providers: [RabbitMQService],
    controllers: [],
    exports: [RabbitMQService]
})
export class RabbitMQModule {}