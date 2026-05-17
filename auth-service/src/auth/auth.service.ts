import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { SessionService } from '../sessions/session.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { hashPassword, verifyPassword } from './password';

type PostgresError = {
  code?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly sessionService: SessionService,
  ) {}

  async register(body: AuthCredentialsDto) {
    const normalizedEmail = body.email.trim().toLowerCase();

    const existingAccount = await this.accountsRepository.findOne({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    if (existingAccount) {
      throw new ConflictException('An account with this email already exists');
    }

    try {
      const passwordHash = await hashPassword(body.password);
      const account = this.accountsRepository.create({
        email: normalizedEmail,
        passwordHash,
      });

      const savedAccount = await this.accountsRepository.save(account);
      const sessionId = await this.createSessionForAccount(savedAccount);

      this.logger.log(`Account registered: ${savedAccount.email}`);

      return {
        sessionId,
        account: {
          id: savedAccount.id,
          email: savedAccount.email,
        },
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: PostgresError }).driverError
          ?.code === '23505'
      ) {
        throw new ConflictException('An account with this email already exists');
      }

      this.logger.error(
        'Failed to register account',
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to register account');
    }
  }

  async login(body: AuthCredentialsDto) {
    const normalizedEmail = body.email.trim().toLowerCase();
    const account = await this.accountsRepository.findOne({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!account?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(
      body.password,
      account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const sessionId = await this.createSessionForAccount(account);

    this.logger.log(`Account logged in: ${account.email}`);

    return {
      sessionId,
      account: {
        id: account.id,
        email: account.email,
      },
    };
  }

  async logout(sessionId: string | null) {
    if (sessionId) {
      await this.sessionService.deleteAuthSession(sessionId);
    }
  }

  private async createSessionForAccount(account: Pick<Account, 'id' | 'email'>) {
    const sessionId = randomUUID();

    await this.sessionService.createAuthSession(sessionId, {
      accountId: account.id,
      email: account.email,
    });

    return sessionId;
  }
}
