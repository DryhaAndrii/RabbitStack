import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'vehicles.hello' })
  getHello(@Payload() _: unknown) {
    return {
      message: 'Hello world',
      service: 'vehicle-service',
    };
  }
}
