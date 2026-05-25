import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { GetVehicleByIdDto } from './dto/get-vehicle-by-id.dto';
import { ListUserVehiclesDto } from './dto/list-user-vehicles.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @EventPattern('users.created')
  createDefaultVehicleForUser(@Payload() body: { user_id?: string }) {
    return this.vehiclesService.createDefaultVehicleForUser(body.user_id);
  }

  @MessagePattern({ cmd: 'vehicles.list' })
  listUserVehicles(@Payload() query: ListUserVehiclesDto) {
    return this.vehiclesService.listUserVehicles(query);
  }

  @MessagePattern({ cmd: 'vehicles.deleteByUser' })
  deleteVehiclesByUser(@Payload() body: { user_id?: string }) {
    return this.vehiclesService.deleteVehiclesByUser(body.user_id);
  }

  @MessagePattern({ cmd: 'vehicles.get' })
  getVehicleById(@Payload() query: GetVehicleByIdDto) {
    return this.vehiclesService.getVehicleById(query.id);
  }

  @MessagePattern({ cmd: 'vehicles.delete' })
  deleteVehicle(@Payload() body: { id?: number | string }) {
    return this.vehiclesService.deleteVehicle(body.id);
  }

  @MessagePattern({ cmd: 'vehicles.update' })
  updateVehicle(
    @Payload() body: {
      id?: number | string;
      data?: UpdateVehicleDto;
    },
  ) {
    return this.vehiclesService.updateVehicle(body.id, body.data);
  }

  @MessagePattern({ cmd: 'vehicles.create' })
  createVehicle(@Payload() body: CreateVehicleDto) {
    return this.vehiclesService.createVehicle(body);
  }
}
