import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
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
}
