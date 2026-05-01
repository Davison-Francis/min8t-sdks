import { createHmac, timingSafeEqual } from 'crypto';
import type { WebhookEvent } from './types';

export class WebhookVerifier {
  private readonly secret: string;

  constructor(secret: string) {
    if (!secret || !secret.startsWith('whsec_')) {
      throw new Error('Webhook secret must start with "whsec_"');
    }
    this.secret = secret;
  }

  /** Compute the expected HMAC-SHA256 signature for a payload. */
  sign(payload: unknown): string {
    return createHmac('sha256', this.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  /** Verify that a signature matches the payload. Returns true if valid. */
  verify(payload: unknown, signature: string): boolean {
    const expected = this.sign(payload);
    if (expected.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * Verify and parse a webhook request.
   * @param payload - The raw JSON body (already parsed)
   * @param signature - The X-ListCleaner-Signature header value
   * @returns The typed webhook event
   * @throws Error if signature is invalid
   */
  verifyAndParse(payload: unknown, signature: string): WebhookEvent {
    if (!this.verify(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }
    return payload as WebhookEvent;
  }
}
