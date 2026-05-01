export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function hasErrorCode(value: unknown): value is { code: string } {
  return typeof value === 'object' && value !== null && 'code' in value && typeof (value as { code: unknown }).code === 'string';
}

export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: unknown }).message === 'string') return (error as { message: string }).message;
  if (typeof error === 'string') return error;
  return fallback;
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) return error.stack;
  return undefined;
}
