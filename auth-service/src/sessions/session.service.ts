import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, type RedisClientType } from 'redis';
import { getRequiredEnv, getRequiredNumberEnv } from '../env';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private readonly client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: `redis://${getRequiredEnv('REDIS_HOST')}:${getRequiredNumberEnv('REDIS_PORT')}`,
    });

    this.client.on('error', (error) => {
      this.logger.error(
        `Redis connection error: ${error.message}`,
        error.stack,
      );
    });
  }

  async onModuleInit() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }

  async createAuthSession(sessionId: string, payload: Record<string, unknown>) {
    await this.client.set(`session:${sessionId}`, JSON.stringify(payload), {
      EX: SESSION_TTL_SECONDS,
    });
  }

  async getAuthSession(sessionId: string): Promise<Record<string, unknown> | null> {
    const rawSession = await this.client.get(`session:${sessionId}`);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as Record<string, unknown>;
    } catch (error) {
      this.logger.warn(
        `Invalid session payload for session:${sessionId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      await this.deleteAuthSession(sessionId);
      return null;
    }
  }

  async deleteAuthSession(sessionId: string) {
    await this.client.del(`session:${sessionId}`);
  }
}
