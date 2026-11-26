import { Injectable } from '@nestjs/common';

import { ADDITIONAL_FEATURE_NAMES } from '@contexts/properties/application/services/write/property-search-view-consolidation/property-search-view-consolidation.service';
import type { ListingAttributeValue } from '@contexts/properties/domain/interfaces/listing-attribute-value.interface';
import type { ListingAttributes } from '@contexts/properties/domain/interfaces/listing-attributes.interface';

const GENERAL_ATTRIBUTE_NAMES = [
  'title',
  'description',
  'builtArea',
  'usableArea',
  'plotArea',
  'bedrooms',
  'bathrooms',
  'yearBuilt',
  'propertyType',
  'condition',
] as const;

type Payload = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Reads the payloads of the listings events. They come from another context, so they are read defensively and never
 * typed against it; unknown or malformed data yields nothing (HR-F002-BR4).
 */
@Injectable()
export class ListingEventPayloadMapper {
  /** The attributes of a `ListingImported` payload by name, with the additional features flattened. */
  toAttributes(payload: Payload): ListingAttributes {
    const attributes: Record<string, ListingAttributeValue> = {};
    const features = isRecord(payload['features']) ? payload['features'] : {};

    for (const name of GENERAL_ATTRIBUTE_NAMES) {
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
  toPriceCents(payload: Payload): number | null {
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
