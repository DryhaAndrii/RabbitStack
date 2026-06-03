import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { ListUserVehiclesDto } from './dto/list-user-vehicles.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
  ) {}

  async getVehicleById(vehicleIdRaw: number | string) {
    const vehicleId = normalizePositiveInteger(vehicleIdRaw, 0, 'id');

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      user_id: vehicle.userId,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  }

  async deleteVehicle(vehicleIdRaw: number | string | undefined) {
    const vehicleId = normalizePositiveInteger(vehicleIdRaw, 0, 'id');

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.vehiclesRepository.delete({ id: vehicleId });

    this.logger.log(`Vehicle ${vehicleId} deleted for user ${vehicle.userId}`);

    return {
      ok: true,
      message: 'Vehicle deleted successfully',
      vehicle: {
        id: vehicle.id,
        user_id: vehicle.userId,
      },
    };
  }

  async deleteVehiclesByUser(userIdRaw: string | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    if (!isUuidV4(userId)) {
      throw new BadRequestException('user_id must be a valid UUID');
    }

    const deleteResult = await this.vehiclesRepository.delete({ userId });

    this.logger.log(
      `Deleted ${deleteResult.affected ?? 0} vehicles for user ${userId}`,
    );

    return {
      ok: true,
      deletedCount: deleteResult.affected ?? 0,
    };
  }

  async updateVehicle(
    vehicleIdRaw: number | string | undefined,
    body: UpdateVehicleDto | undefined,
  ) {
    const vehicleId = normalizePositiveInteger(vehicleIdRaw, 0, 'id');
    const payload = body ?? { user_id: '' };
    const userId =
      typeof payload.user_id === 'string' ? payload.user_id.trim() : '';

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    if (!isUuidV4(userId)) {
      throw new BadRequestException('user_id must be a valid UUID');
    }

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const existingUsers = (await this.vehiclesRepository.query(
      'SELECT id FROM users WHERE id = $1 LIMIT 1',
      [userId],
    )) as Array<{ id: string }>;

    if (existingUsers.length === 0) {
      throw new NotFoundException('User not found');
    }

    vehicle.make = normalizeTextField(payload.make, 'Unknown');
    vehicle.model = normalizeTextField(payload.model, 'Unknown');
    vehicle.year = normalizeYearField(payload.year);
    vehicle.userId = userId;

    const savedVehicle = await this.vehiclesRepository.save(vehicle);

    this.logger.log(`Vehicle ${savedVehicle.id} updated for user ${savedVehicle.userId}`);

    return {
      ok: true,
      message: 'Vehicle updated successfully',
      vehicle: {
        id: savedVehicle.id,
        make: savedVehicle.make,
        model: savedVehicle.model,
        year: savedVehicle.year,
        user_id: savedVehicle.userId,
        created_at: savedVehicle.createdAt,
        updated_at: savedVehicle.updatedAt,
      },
    };
  }

  async createDefaultVehicleForUser(userIdRaw: string | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    if (!isUuidV4(userId)) {
      throw new BadRequestException('user_id must be a valid UUID');
    }

    const existingUsers = (await this.vehiclesRepository.query(
      'SELECT id FROM users WHERE id = $1 LIMIT 1',
      [userId],
    )) as Array<{ id: string }>;

    if (existingUsers.length === 0) {
      throw new NotFoundException('User not found');
    }

    const vehicle = this.vehiclesRepository.create({
      make: 'Unknown',
      model: 'Unknown',
      year: null,
      userId,
    });

    const savedVehicle = await this.vehiclesRepository.save(vehicle);

    this.logger.log(`Default vehicle ${savedVehicle.id} created for user ${savedVehicle.userId}`);

    return savedVehicle;
  }

  async listUserVehicles(query: ListUserVehiclesDto) {
    const userId = typeof query.user_id === 'string' ? query.user_id.trim() : '';
    const page = normalizePositiveInteger(query.page, 1, 'page');
    const limit = normalizePositiveInteger(query.limit, 10, 'limit');
    const skip = (page - 1) * limit;

    if (userId !== '' && !isUuidV4(userId)) {
      throw new BadRequestException('user_id must be a valid UUID');
    }

    const [vehicles, total] = await this.vehiclesRepository.findAndCount({
      where: userId === '' ? {} : { userId },
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: vehicles.map((vehicle) => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        user_id: vehicle.userId,
        created_at: vehicle.createdAt,
        updated_at: vehicle.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + vehicles.length < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async createVehicle(body: CreateVehicleDto) {
    const userId = typeof body.user_id === 'string' ? body.user_id.trim() : '';

    if (!userId) {
      throw new BadRequestException('user_id is required');
    }

    const existingUsers = (await this.vehiclesRepository.query(
      'SELECT id FROM users WHERE id = $1 LIMIT 1',
      [userId],
    )) as Array<{ id: string }>;

    if (existingUsers.length === 0) {
      throw new NotFoundException('User not found');
    }

    const savedVehicle = await this.saveVehicle({
      make: normalizeTextField(body.make, 'Unknown'),
      model: normalizeTextField(body.model, 'Unknown'),
      year: normalizeYearField(body.year),
      userId,
    });

    this.logger.log(`Vehicle ${savedVehicle.id} created for user ${savedVehicle.userId}`);

    return {
      ok: true,
      message: 'Vehicle created successfully',
      vehicle: {
        id: savedVehicle.id,
        make: savedVehicle.make,
        model: savedVehicle.model,
        year: savedVehicle.year,
        user_id: savedVehicle.userId,
        created_at: savedVehicle.createdAt,
        updated_at: savedVehicle.updatedAt,
      },
    };
  }

  private async saveVehicle(input: {
    make: string | null;
    model: string | null;
    year: number | null;
    userId: string;
  }) {
    const vehicle = this.vehiclesRepository.create(input);
    return this.vehiclesRepository.save(vehicle);
  }
}

function normalizeTextField(value: string | null | undefined, fallback: string) {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '' ? fallback : trimmedValue;
}

function normalizeYearField(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isInteger(value)) {
    throw new BadRequestException('year must be an integer or null');
  }

  return value;
}

function normalizePositiveInteger(
  value: number | string | null | undefined,
  fallback: number,
  fieldName: string,
) {
  if (value === null || value === undefined || value === '') {
    if (fallback >= 1) {
      return fallback;
    }

    throw new BadRequestException(`${fieldName} is required`);
  }

  const numericValue =
    typeof value === 'number' ? value : Number.parseInt(value, 10);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new BadRequestException(`${fieldName} must be a positive integer`);
  }

  return numericValue;
}

function isUuidV4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
