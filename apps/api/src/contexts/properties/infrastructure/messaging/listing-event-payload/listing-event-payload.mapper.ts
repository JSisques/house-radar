import { Injectable } from '@nestjs/common';

import { isRecord } from '@house-radar/building-blocks';
import type { OutboxMessage } from '@house-radar/outbox';
import { ADDITIONAL_FEATURE_NAMES, GENERAL_LISTING_ATTRIBUTE_NAMES } from '@house-radar/shared-kernel';

import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';

/**
 * Reads the payloads of the listings events. They come from another context, so they are read defensively and never
 * typed against it; unknown or malformed data yields nothing (HR-F002-BR4).
 */
@Injectable()
export class ListingEventPayloadMapper {
  /** The attributes of a `ListingImported` payload by name, with the additional features flattened. */
  toAttributes(payload: OutboxMessage['payload']): ListingAttributes {
    const attributes: Record<string, ListingAttributeValue> = {};
    const features = isRecord(payload['features']) ? payload['features'] : {};

    for (const name of GENERAL_LISTING_ATTRIBUTE_NAMES) {
      const value = this.knownValue(payload[name]);
      if (value !== undefined) attributes[name] = value;
    }
    for (const name of ADDITIONAL_FEATURE_NAMES) {
      const value = this.knownValue(features[name]);
      if (value !== undefined) attributes[name] = value;
    }
    return attributes;
  }

  /** The price in euro cents, or null when it is unknown. */
  toPriceCents(payload: OutboxMessage['payload']): number | null {
    const price = this.knownValue(payload['price']);
    return typeof price === 'number' ? price : null;
  }

  /** The value of a serialized `Known<T> | Unknown` datum. */
  private knownValue(datum: unknown): ListingAttributeValue | undefined {
    if (!isRecord(datum) || datum['kind'] !== 'known') return undefined;
    const { value } = datum;
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
  }
}
