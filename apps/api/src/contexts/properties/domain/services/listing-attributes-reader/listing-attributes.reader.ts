import type {
  ListingAttributes,
  ListingAttributeValue,
} from '@contexts/properties/domain/interfaces/projected-listing-props.interface';
import { ADDITIONAL_FEATURE_NAMES } from '@contexts/properties/domain/services/property-search-view-consolidation/property-search-view-consolidation.service';

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The value of a serialized `Known<T> | Unknown` datum; unknown or malformed data yields nothing (HR-F002-BR4). */
export function readKnownValue(datum: unknown): ListingAttributeValue | undefined {
  if (!isRecord(datum) || datum['kind'] !== 'known') return undefined;
  const { value } = datum;
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
}

/**
 * Reads the attributes of a `ListingImported` payload by name, with the additional features flattened. The payload
 * comes from another context, so it is read defensively and never typed against it.
 */
export function readListingAttributes(payload: Readonly<Record<string, unknown>>): ListingAttributes {
  const attributes: Record<string, ListingAttributeValue> = {};
  const features = isRecord(payload['features']) ? payload['features'] : {};

  for (const name of GENERAL_ATTRIBUTE_NAMES) {
    const value = readKnownValue(payload[name]);
    if (value !== undefined) attributes[name] = value;
  }
  for (const name of ADDITIONAL_FEATURE_NAMES) {
    const value = readKnownValue(features[name]);
    if (value !== undefined) attributes[name] = value;
  }
  return attributes;
}
