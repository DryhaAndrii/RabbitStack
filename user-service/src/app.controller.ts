import { Inject } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('VEHICLE_SERVICE')
    private readonly vehicleServiceClient: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello world';
  }

  @Get('vehicles/hello')
  async getVehicleHello() {
    return firstValueFrom(
      this.vehicleServiceClient.send({ cmd: 'vehicles.hello' }, {}),
    );
  }
}
