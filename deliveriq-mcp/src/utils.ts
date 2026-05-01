import {
  DeliverIQError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  ConflictError,
} from '@deliveriq/sdk';
import { CHARACTER_LIMIT } from './constants.js';

type McpContent = { content: Array<{ type: 'text'; text: string }>; isError?: true };

/**
 * Map SDK errors to agent-friendly MCP error responses with actionable guidance.
 */
export function handleSdkError(error: unknown): McpContent {
  const err = error as any;
  if (error instanceof AuthenticationError) {
    return errorResponse(
      'Authentication failed. Verify that the DELIVERIQ_API_KEY environment variable ' +
      'contains a valid API key (format: lc_prefix_secret).',
    );
  }
  if (error instanceof InsufficientCreditsError) {
    return errorResponse(
      `Insufficient credits. Current balance: ${err.balance}, required: ${err.required}. ` +
      'Use deliveriq_check_credits to see usage breakdown, or upgrade your plan.',
    );
  }
  if (error instanceof RateLimitError) {
    return errorResponse(
      `Rate limit exceeded. Retry after ${err.retryAfter} seconds. ` +
      'The SDK will automatically retry — if you see this, max retries were exhausted.',
    );
  }
  if (error instanceof ValidationError) {
    const details = err.details?.map((d: any) => `${d.path}: ${d.message}`).join('; ') ?? err.message;
    return errorResponse(`Validation error: ${details}`);
  }
  if (error instanceof NotFoundError) {
    return errorResponse(`Not found: ${err.message}. Check that the ID or resource exists.`);
  }
  if (error instanceof ConflictError) {
    return errorResponse(`Conflict: ${err.message}. The resource may already be in the requested state.`);
  }
  if (error instanceof DeliverIQError) {
    return errorResponse(`API error (${err.status}): ${err.message}`);
  }
  if (error instanceof Error) {
    return errorResponse(`Unexpected error: ${error.message}`);
  }
  return errorResponse(`Unknown error: ${String(error)}`);
}

/**
 * Truncate text that exceeds CHARACTER_LIMIT with a clear message.
 */
export function truncateResponse(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  const truncated = text.slice(0, CHARACTER_LIMIT);
  return truncated + '\n\n[Response truncated. Use filtering or pagination parameters to see more results.]';
}

/**
 * Build a successful MCP tool response.
 */
export function successResponse(text: string): McpContent {
  return { content: [{ type: 'text', text: truncateResponse(text) }] };
}

/**
 * Build an error MCP tool response.
 */
function errorResponse(text: string): McpContent {
  return { content: [{ type: 'text', text }], isError: true };
}
