import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { forwardRpc } from '../common/rpc-to-http';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    @Inject('VEHICLE_SERVICE')
    private readonly vehicleServiceClient: ClientProxy,
  ) {}

  @Get()
  async listUserVehicles(@Query() query: Record<string, unknown>) {
    return forwardRpc(
      this.vehicleServiceClient.send({ cmd: 'vehicles.list' }, query),
    );
  }

  @Get(':id')
  async getVehicleById(@Param('id') id: string) {
    return forwardRpc(
      this.vehicleServiceClient.send({ cmd: 'vehicles.get' }, { id }),
    );
  }

  @Put(':id')
  async updateVehicle(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return forwardRpc(
      this.vehicleServiceClient.send({ cmd: 'vehicles.update' }, { id, data: body }),
    );
  }

  @Delete(':id')
  async deleteVehicle(@Param('id') id: string) {
    return forwardRpc(
      this.vehicleServiceClient.send({ cmd: 'vehicles.delete' }, { id }),
    );
  }

  @Post()
  async createVehicle(@Body() body: Record<string, unknown>) {
    return forwardRpc(
      this.vehicleServiceClient.send({ cmd: 'vehicles.create' }, body),
    );
  }
}
