function getEnvValue(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getRequiredEnv(name: string): string {
  return getEnvValue(name);
}

export function getRequiredNumberEnv(name: string): number {
  const value = Number(getEnvValue(name));

  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return value;
}

export function getBooleanEnv(name: string, fallback = false): boolean {
  const value = process.env[name];

  if (value == null || value.trim() === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}
