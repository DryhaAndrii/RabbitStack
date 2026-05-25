import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VehicleSchemaService implements OnModuleInit {
  private readonly logger = new Logger(VehicleSchemaService.name);
  private readonly maxAttempts = 15;
  private readonly retryDelayMs = 2000;

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.waitForUsersTable();

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        make VARCHAR(255) NULL,
        model VARCHAR(255) NULL,
        year INTEGER NULL,
        user_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.dataSource.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'fk_vehicles_user'
        ) THEN
          ALTER TABLE vehicles
          ADD CONSTRAINT fk_vehicles_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE RESTRICT;
        END IF;
      END
      $$;
    `);

    await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_user_id
      ON vehicles(user_id)
    `);

    this.logger.log('Vehicle schema is ready');
  }

  private async waitForUsersTable() {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      const result = (await this.dataSource.query(
        `SELECT to_regclass('public.users') AS table_name`,
      )) as Array<{ table_name: string | null }>;

      if (result[0]?.table_name === 'users') {
        return;
      }

      this.logger.warn(
        `Users table is not ready yet, retrying (${attempt}/${this.maxAttempts})`,
      );

      await sleep(this.retryDelayMs);
    }

    throw new Error('Users table was not created in time');
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
