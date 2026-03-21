import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filter/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { getRabbitMQConfig, MICROSERVICE_CONFIGS } from './rabbitmq/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Register one microservice connection per (queue, routingKey) pair.
  // amqplib requires routingKey to be a single string — arrays crash at queue bind.
  for (const config of MICROSERVICE_CONFIGS) {
    app.connectMicroservice(getRabbitMQConfig(config.queue, config.routingKey));
  }

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.startAllMicroservices();
  console.log('RabbitMQ microservices started');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
