import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { forwardRpc } from '../common/rpc-to-http';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  @Get()
  async listUsers(@Query() query: Record<string, unknown>) {
    return forwardRpc(
      this.userServiceClient.send({ cmd: 'users.list' }, query),
    );
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return forwardRpc(
      this.userServiceClient.send({ cmd: 'users.get' }, { id }),
    );
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return forwardRpc(
      this.userServiceClient.send({ cmd: 'users.update' }, { id, data: body }),
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return forwardRpc(
      this.userServiceClient.send({ cmd: 'users.delete' }, { id }),
    );
  }

  @Post()
  async submitUserEmail(@Body() body: Record<string, unknown>) {
    return forwardRpc(
      this.userServiceClient.send({ cmd: 'users.create' }, body),
    );
  }
}
