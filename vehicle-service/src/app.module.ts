import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { getRequiredEnv, getRequiredNumberEnv } from './env';
import { VehiclesModule } from './vehicles/vehicles.module';

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
      synchronize: false,
    }),
    VehiclesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
