import { describe, expect, it } from 'vitest';

import { FieldIsRequiredException } from '@house-radar/building-blocks';
import { ListingUrl, SourceId } from '@house-radar/shared-kernel';

import { ListingBuilder } from '@contexts/listings/domain/builders/listing/listing.builder';
import { ListingBuilderFactory } from '@contexts/listings/domain/builders/listing/listing-builder.factory';

describe('ListingBuilder', () => {
  it('requires source, original URL and date added', () => {
    const source = new SourceId('idealista');
    const url = new ListingUrl('https://example.com/a');

    expect(() => new ListingBuilder().withOriginalUrl(url).build()).toThrow(FieldIsRequiredException);
    expect(() => new ListingBuilder().withSource(source).build()).toThrow(FieldIsRequiredException);
    expect(() => new ListingBuilder().withSource(source).withOriginalUrl(url).build()).toThrow(
      FieldIsRequiredException,
    );
  });

  it('is created fresh by the stateless factory on every call', () => {
    const factory = new ListingBuilderFactory();
    expect(factory.create()).toBeInstanceOf(ListingBuilder);
    expect(factory.create()).not.toBe(factory.create());
  });
});
