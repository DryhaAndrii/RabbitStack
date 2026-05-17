import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/auth.decorators';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello(): string {
    return 'Auth service is running';
  }
}
