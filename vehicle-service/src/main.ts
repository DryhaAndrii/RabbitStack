import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { getRequiredEnv } from './env';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [getRequiredEnv('RABBITMQ_URL')],
        queue: getRequiredEnv('RABBITMQ_QUEUE'),
        queueOptions: {
          durable: false,
        },
        noAck: true,
      },
    },
  );

  await app.listen();
}
bootstrap();
