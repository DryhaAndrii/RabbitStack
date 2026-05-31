import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmail, isUUID } from 'class-validator';
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

function isStrictEmail(value: string) {
  const domain = value.split('@')[1] ?? '';

  return (
    isEmail(value, { require_tld: true }) &&
    domain.includes('.') &&
    !domain.startsWith('.') &&
    !domain.endsWith('.')
  );
}

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
      throw this.rpcException(400, 'User id must be a valid UUID');
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
      throw this.rpcException(404, 'User not found');
    }

    return user;
  }

  async updateUser(userIdRaw: string | undefined, body: UpdateUserDto | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!isUUID(userId, '4')) {
      throw this.rpcException(400, 'User id must be a valid UUID');
    }

    const normalizedEmail = body?.email?.trim().toLowerCase() ?? '';

    if (normalizedEmail === '') {
      throw this.rpcException(400, 'Email is required');
    }

    if (!isStrictEmail(normalizedEmail)) {
      throw this.rpcException(400, 'Please provide a valid email address');
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
      throw this.rpcException(404, 'User not found');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser && existingUser.id !== userId) {
      throw this.rpcException(409, 'A user with this email already exists');
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
        throw this.rpcException(409, 'A user with this email already exists');
      }

      this.logger.error('Failed to update user', error instanceof Error ? error.stack : undefined);
      throw this.rpcException(500, 'Failed to update user');
    }
  }

  async deleteUser(userIdRaw: string | undefined) {
    const userId = typeof userIdRaw === 'string' ? userIdRaw.trim() : '';

    if (!isUUID(userId, '4')) {
      throw this.rpcException(400, 'User id must be a valid UUID');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw this.rpcException(404, 'User not found');
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
      throw this.rpcException(500, 'Failed to delete user');
    }
  }

  async submitUserEmail(body: CreateUserDto) {
    const normalizedEmail = body.email.trim().toLowerCase();

    if (normalizedEmail === '') {
      throw this.rpcException(400, 'Email is required');
    }

    if (!isStrictEmail(normalizedEmail)) {
      throw this.rpcException(400, 'Please provide a valid email address');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingUser) {
      throw this.rpcException(409, 'A user with this email already exists');
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
        throw this.rpcException(409, 'A user with this email already exists');
      }

      this.logger.error('Failed to save user', error instanceof Error ? error.stack : undefined);
      throw this.rpcException(500, 'Failed to save user');
    }
  }

  private rpcException(statusCode: number, message: string) {
    return new RpcException({
      statusCode,
      message,
      error: this.getErrorLabel(statusCode),
    });
  }

  private getErrorLabel(statusCode: number) {
    if (statusCode === 400) {
      return 'Bad Request';
    }

    if (statusCode === 404) {
      return 'Not Found';
    }

    if (statusCode === 409) {
      return 'Conflict';
    }

    return 'Internal Server Error';
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
