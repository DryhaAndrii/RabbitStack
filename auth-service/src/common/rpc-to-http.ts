import { HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';

type RpcErrorPayload = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  status?: string;
  cause?: unknown;
  response?: unknown;
};

const logger = new Logger('RpcToHttp');

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractRpcPayload(error: unknown): RpcErrorPayload | null {
  if (!isObject(error)) {
    return null;
  }

  const candidate = error as RpcErrorPayload;

  if (
    typeof candidate.statusCode === 'number' ||
    typeof candidate.message === 'string' ||
    Array.isArray(candidate.message)
  ) {
    return candidate;
  }

  if (isObject(candidate.response)) {
    return extractRpcPayload(candidate.response);
  }

  if (isObject(candidate.error)) {
    return extractRpcPayload(candidate.error);
  }

  if (isObject(candidate.cause)) {
    return extractRpcPayload(candidate.cause);
  }

  return null;
}

function toHttpException(error: unknown) {
  if (error instanceof HttpException) {
    return error;
  }

  const payload = extractRpcPayload(error);

  if (payload) {
    if (typeof payload.statusCode === 'number') {
      return new HttpException(
        {
          message: payload.message ?? 'Request failed',
          error: payload.error,
          statusCode: payload.statusCode,
        },
        payload.statusCode,
      );
    }

    if (typeof payload.message === 'string' && payload.message !== 'Internal server error') {
      return new InternalServerErrorException(payload.message);
    }
  }

  if (error instanceof Error) {
    return new InternalServerErrorException(error.message);
  }

  return new InternalServerErrorException('Internal server error');
}

export async function forwardRpc<T>(stream: Observable<T>) {
  try {
    return await firstValueFrom(stream);
  } catch (error) {
    logger.error(`RPC bridge error: ${safeStringify(error)}`);
    throw toHttpException(error);
  }
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
