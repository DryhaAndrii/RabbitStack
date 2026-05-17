import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'users.hello' })
  getHello(): string {
    return 'User service microservice is running';
  }
}
