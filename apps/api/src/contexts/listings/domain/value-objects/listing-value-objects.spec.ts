import { describe, expect, it } from 'vitest';

import { InvalidBathroomCountException } from '@contexts/listings/domain/exceptions/invalid-bathroom-count/invalid-bathroom-count.exception';
import { InvalidBedroomCountException } from '@contexts/listings/domain/exceptions/invalid-bedroom-count/invalid-bedroom-count.exception';
import { InvalidLandTypeException } from '@contexts/listings/domain/exceptions/invalid-land-type/invalid-land-type.exception';
import { InvalidListingDescriptionException } from '@contexts/listings/domain/exceptions/invalid-listing-description/invalid-listing-description.exception';
import { InvalidListingStatusException } from '@contexts/listings/domain/exceptions/invalid-listing-status/invalid-listing-status.exception';
import { InvalidListingTitleException } from '@contexts/listings/domain/exceptions/invalid-listing-title/invalid-listing-title.exception';
import { InvalidYearBuiltException } from '@contexts/listings/domain/exceptions/invalid-year-built/invalid-year-built.exception';
import { Bathrooms } from '@contexts/listings/domain/value-objects/bathrooms/bathrooms.value-object';
import { Bedrooms } from '@contexts/listings/domain/value-objects/bedrooms/bedrooms.value-object';
import { LandType } from '@contexts/listings/domain/value-objects/land-type/land-type.value-object';
import { ListingDescription } from '@contexts/listings/domain/value-objects/listing-description/listing-description.value-object';
import { ListingStatus } from '@contexts/listings/domain/value-objects/listing-status/listing-status.value-object';
import { ListingTitle } from '@contexts/listings/domain/value-objects/listing-title/listing-title.value-object';
import { YearBuilt } from '@contexts/listings/domain/value-objects/year-built/year-built.value-object';

describe('listing value objects', () => {
  it('ListingTitle rejects blank and over-long text', () => {
    expect(new ListingTitle('Piso luminoso').toPrimitives()).toBe('Piso luminoso');
    expect(() => new ListingTitle('   ')).toThrow(InvalidListingTitleException);
    expect(() => new ListingTitle('x'.repeat(301))).toThrow(InvalidListingTitleException);
  });

  it('ListingDescription rejects blank and over-long text', () => {
    expect(new ListingDescription('Reformado').toPrimitives()).toBe('Reformado');
    expect(() => new ListingDescription('')).toThrow(InvalidListingDescriptionException);
    expect(() => new ListingDescription('x'.repeat(20001))).toThrow(InvalidListingDescriptionException);
  });

  it('Bedrooms and Bathrooms accept whole numbers from zero', () => {
    expect(new Bedrooms(0).toPrimitives()).toBe(0);
    expect(new Bathrooms(2).toPrimitives()).toBe(2);
    expect(() => new Bedrooms(-1)).toThrow(InvalidBedroomCountException);
    expect(() => new Bedrooms(2.5)).toThrow(InvalidBedroomCountException);
    expect(() => new Bathrooms(-1)).toThrow(InvalidBathroomCountException);
    expect(() => new Bathrooms(Number.NaN)).toThrow(InvalidBathroomCountException);
  });

  it('YearBuilt rejects zero, absurd and far-future years', () => {
    expect(new YearBuilt(1998).toPrimitives()).toBe(1998);
    expect(() => new YearBuilt(0)).toThrow(InvalidYearBuiltException);
    expect(() => new YearBuilt(1998.5)).toThrow(InvalidYearBuiltException);
    expect(() => new YearBuilt(3000)).toThrow(InvalidYearBuiltException);
  });

  it('ListingStatus is a closed list', () => {
    for (const status of ['active', 'disappeared', 'unknown']) {
      expect(new ListingStatus(status).toPrimitives()).toBe(status);
    }
    expect(() => new ListingStatus('sold')).toThrow(InvalidListingStatusException);
  });

  it('LandType rejects blank text', () => {
    expect(new LandType('urbano').toPrimitives()).toBe('urbano');
    expect(() => new LandType(' ')).toThrow(InvalidLandTypeException);
  });
});
