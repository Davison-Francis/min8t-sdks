import type { ApiErrorBody } from './types';

export class DeliverIQError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string; code: string }>;
  readonly headers: Headers;

  constructor(status: number, body: ApiErrorBody, headers: Headers) {
    super(body.error.message);
    this.name = 'DeliverIQError';
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
    this.headers = headers;
  }
}

export class ValidationError extends DeliverIQError {
  constructor(body: ApiErrorBody, headers: Headers) {
    super(400, body, headers);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends DeliverIQError {
  constructor(body: ApiErrorBody, headers: Headers) {
    super(401, body, headers);
    this.name = 'AuthenticationError';
  }
}

export class InsufficientCreditsError extends DeliverIQError {
  readonly balance: number;
  readonly required: number;

  constructor(body: ApiErrorBody, headers: Headers) {
    super(402, body, headers);
    this.name = 'InsufficientCreditsError';
    this.balance = body.error.balance ?? 0;
    this.required = body.error.required ?? 0;
  }
}

export class NotFoundError extends DeliverIQError {
  constructor(body: ApiErrorBody, headers: Headers) {
    super(404, body, headers);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DeliverIQError {
  constructor(body: ApiErrorBody, headers: Headers) {
    super(409, body, headers);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends DeliverIQError {
  readonly retryAfter: number;

  constructor(body: ApiErrorBody, headers: Headers) {
    super(429, body, headers);
    this.name = 'RateLimitError';
    this.retryAfter = body.error.retryAfter
      ?? parseInt(headers.get('Retry-After') ?? '60', 10);
  }
}

export function classifyError(status: number, body: ApiErrorBody, headers: Headers): DeliverIQError {
  switch (status) {
    case 400: return new ValidationError(body, headers);
    case 401: return new AuthenticationError(body, headers);
    case 402: return new InsufficientCreditsError(body, headers);
    case 404: return new NotFoundError(body, headers);
    case 409: return new ConflictError(body, headers);
    case 429: return new RateLimitError(body, headers);
    default:  return new DeliverIQError(status, body, headers);
  }
}
