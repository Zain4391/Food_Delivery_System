import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filter/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { getRabbitMQConfig, QUEUE_CONFIGS } from './rabbitmq/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(getRabbitMQConfig(QUEUE_CONFIGS.ORDERS));
  app.connectMicroservice(getRabbitMQConfig(QUEUE_CONFIGS.RESTAURANTS));
  app.connectMicroservice(getRabbitMQConfig(QUEUE_CONFIGS.DELIVERY));


  // Global exception filter registration
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validation for DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  await app.startAllMicroservices();
  console.log("RabbitMQ microservices started");
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
