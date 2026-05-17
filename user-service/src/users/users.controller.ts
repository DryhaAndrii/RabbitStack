import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'users.list' })
  listUsers(@Payload() query: ListUsersQueryDto) {
    return this.usersService.listUsers(query);
  }

  @MessagePattern({ cmd: 'users.create' })
  submitUserEmail(@Payload() body: CreateUserDto) {
    return this.usersService.submitUserEmail(body);
  }
}
