import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRequiredEnv } from '../env';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ClientsModule.register([
      {
        name: 'VEHICLE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [getRequiredEnv('RABBITMQ_URL')],
          queue: getRequiredEnv('VEHICLE_SERVICE_QUEUE'),
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
