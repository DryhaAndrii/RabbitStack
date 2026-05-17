import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  async listUsers(@Query() query: Record<string, unknown>) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.list' }, query),
    );
  }

  @Post()
  async submitUserEmail(@Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.create' }, body),
    );
  }
}
