import { ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, RpcException, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { getRequiredEnv } from './env';

function flattenValidationErrors(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const ownMessages = error.constraints ? Object.values(error.constraints) : [];
    const nestedMessages = error.children?.length
      ? flattenValidationErrors(error.children)
      : [];

    return [...ownMessages, ...nestedMessages];
  });
}

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[] = []) => {
        const messages = flattenValidationErrors(errors);

        return new RpcException({
          statusCode: 400,
          message:
            messages.length > 0 ? messages : ['Validation failed'],
          error: 'Bad Request',
        });
      },
    }),
  );

  await app.listen();
}
bootstrap();
