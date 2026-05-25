import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByIdDto } from './dto/get-user-by-id.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type PostgresError = {
  code?: string;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject('VEHICLE_SERVICE')
    private readonly vehicleServiceClient: ClientProxy,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [users, total] = await this.usersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      items: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + users.length < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserById(payload: GetUserByIdDto) {
    const userId = payload.id.trim();

    if (!isUUID(userId, '4')) {
      throw new BadRequestException('User id must be a valid UUID');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userIdRaw: string | undefined, body: UpdateUserDto | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!isUUID(userId, '4')) {
      throw new BadRequestException('User id must be a valid UUID');
    }

    const normalizedEmail = body?.email?.trim().toLowerCase() ?? '';

    if (normalizedEmail === '') {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('A user with this email already exists');
    }

    try {
      user.email = normalizedEmail;
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User ${savedUser.id} updated with email: ${savedUser.email}`);

      return {
        ok: true,
        message: 'User updated successfully',
        user: {
          id: savedUser.id,
          email: savedUser.email,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: PostgresError }).driverError
          ?.code === '23505'
      ) {
        throw new ConflictException('A user with this email already exists');
      }

      this.logger.error('Failed to update user', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUser(userIdRaw: string | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!isUUID(userId, '4')) {
      throw new BadRequestException('User id must be a valid UUID');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await firstValueFrom(
        this.vehicleServiceClient.send({ cmd: 'vehicles.deleteByUser' }, {
          user_id: userId,
        }),
      );

      await this.usersRepository.delete({ id: userId });

      this.logger.log(`User ${userId} and related vehicles deleted`);

      return {
        ok: true,
        message: 'User deleted successfully',
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to delete user',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async submitUserEmail(body: CreateUserDto) {
    const normalizedEmail = body.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    try {
      const user = this.usersRepository.create({
        email: normalizedEmail,
      });

      const savedUser = await this.usersRepository.save(user);

      await this.emitUserCreatedEvent(savedUser.id);

      this.logger.log(`User created with email: ${savedUser.email}`);

      return {
        ok: true,
        message: 'User saved successfully',
        user: {
          id: savedUser.id,
          email: savedUser.email,
        },
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: PostgresError }).driverError
          ?.code === '23505'
      ) {
        throw new ConflictException('A user with this email already exists');
      }

      this.logger.error('Failed to save user', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to save user');
    }
  }

  private async emitUserCreatedEvent(userId: string) {
    try {
      await firstValueFrom(
        this.vehicleServiceClient.emit('users.created', {
          user_id: userId,
        }),
      );

      this.logger.log(`Default vehicle creation requested for user ${userId}`);
    } catch (error) {
      this.logger.warn(
        `Failed to emit default vehicle creation event for user ${userId}`,
      );
      this.logger.warn(error instanceof Error ? error.message : 'Unknown vehicle event error');
    }
  }
}
