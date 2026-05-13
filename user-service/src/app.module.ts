import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { getBooleanEnv, getRequiredEnv, getRequiredNumberEnv } from './env';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: getRequiredEnv('DB_HOST'),
      port: getRequiredNumberEnv('DB_PORT'),
      username: getRequiredEnv('DB_USER'),
      password: getRequiredEnv('DB_PASSWORD'),
      database: getRequiredEnv('DB_NAME'),
      autoLoadEntities: true,
      synchronize: getBooleanEnv('DB_SYNCHRONIZE', true),
    }),
    ClientsModule.register([
      {
        name: 'VEHICLE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [getRequiredEnv('RABBITMQ_URL')],
          queue: getRequiredEnv('RABBITMQ_QUEUE'),
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
