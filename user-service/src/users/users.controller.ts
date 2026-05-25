import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.list' })
  listUsers(@Payload() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @MessagePattern({ cmd: 'users.get' })
  getUserById(@Payload() payload: GetUserByIdDto) {
    return this.usersService.getUserById(payload);
  }

  @MessagePattern({ cmd: 'users.update' })
  updateUser(
    @Payload() body: { id?: string; data?: UpdateUserDto },
  ) {
    return this.usersService.updateUser(body.id, body.data);
  }

  @MessagePattern({ cmd: 'users.delete' })
  deleteUser(@Payload() body: { id?: string }) {
    return this.usersService.deleteUser(body.id);
  }

  @MessagePattern({ cmd: 'users.create' })
  submitUserEmail(@Payload() body: CreateUserDto) {
    return this.usersService.submitUserEmail(body);
  }
}
