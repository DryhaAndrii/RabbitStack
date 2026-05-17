import { Module } from '@nestjs/common';
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
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
