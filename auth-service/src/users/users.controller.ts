import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
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

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.get' }, { id }),
    );
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.update' }, { id, data: body }),
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.delete' }, { id }),
    );
  }

  @Post()
  async submitUserEmail(@Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.userServiceClient.send({ cmd: 'users.create' }, body),
    );
  }
}
