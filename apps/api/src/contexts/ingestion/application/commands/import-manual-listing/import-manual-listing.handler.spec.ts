import { describe, expect, it, vi } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import { ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

import { ImportManualListingCommand } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command';
import { ImportManualListingHandler } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.handler';
import type { IListingRegistryPort } from '@contexts/ingestion/application/ports/listing-registry.port';
import { AssertManualListingInputService } from '@contexts/ingestion/application/services/assert-manual-listing-input/assert-manual-listing-input.service';
import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';
import { DuplicateManualListingException } from '@contexts/ingestion/domain/exceptions/duplicate-manual-listing/duplicate-manual-listing.exception';
import { MissingManualListingFieldsException } from '@contexts/ingestion/domain/exceptions/missing-manual-listing-fields/missing-manual-listing-fields.exception';
import { SourceNotAvailableException } from '@contexts/ingestion/domain/exceptions/source-not-available/source-not-available.exception';
import type { ISourceWriteRepository } from '@contexts/ingestion/domain/repositories/write/source-write.repository';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';
import { SourceName } from '@contexts/ingestion/domain/value-objects/source-name/source-name.value-object';

const URL_WITH_NOISE = 'https://example.com/home/1?ref=a#photos';
const NORMALIZED = 'https://example.com/home/1';
const EXISTING_ID = ListingId.generate();
const NEW_ID = ListingId.generate();
const SOURCE_ID = SourceId.generate();

const manualSource = (enabled = true) =>
  new SourceBuilder()
    .withId(SOURCE_ID)
    .withName(SourceName.manual())
    .withKind(SourceKind.manual())
    .withEnabled(enabled)
    .build();

const setup = (opts: { source?: ReturnType<typeof manualSource> | null; existing?: ListingId | null } = {}) => {
  const sources: ISourceWriteRepository = {
    save: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByKind: vi.fn().mockResolvedValue(opts.source === undefined ? manualSource() : opts.source),
  };
  const registry: IListingRegistryPort = {
    findManualByNormalizedUrl: vi.fn().mockResolvedValue(opts.existing ?? null),
    registerManual: vi.fn().mockResolvedValue(NEW_ID),
  };
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  const handler = new ImportManualListingHandler(
    sources,
    registry,
    () => new DateValueObject(new Date('2026-01-01')),
    new AssertManualListingInputService(),
  );
  return { handler, sources, registry, fetchSpy };
};

describe('ImportManualListingHandler', () => {
  it('creates the listing with its first observation and makes no request to the URL (HR-F001-AC1)', async () => {
    const { handler, registry, fetchSpy } = setup();

    const result = await handler.execute(
      new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 25_000_000 }),
    );

    expect(result).toEqual({ id: NEW_ID.value });
    expect(registry.registerManual).toHaveBeenCalledTimes(1);
    const input = vi.mocked(registry.registerManual).mock.calls[0]![0];
    expect(input.url).toEqual(new ListingUrl(NORMALIZED));
    expect(input.price).toEqual(new Money(25_000_000));
    expect(input.source).toEqual(SOURCE_ID);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('forwards the optional details so unknown fields stay unknown', async () => {
    const { handler, registry } = setup();
    const details = { title: 'Sunny flat', builtArea: 90, bedrooms: 3, features: { garage: true } };

    await handler.execute(new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 25_000_000, details }));
    await handler.execute(new ImportManualListingCommand({ url: 'https://example.com/home/2', priceCents: 1 }));

    const calls = vi.mocked(registry.registerManual).mock.calls;
    expect(calls[0]![0].details).toEqual(details);
    expect(calls[1]![0].details).toEqual({});
  });

  it('creates nothing and reports every missing field (HR-F001-AC2)', async () => {
    const { handler, registry } = setup();

    const error = await handler.execute(new ImportManualListingCommand({ url: '' })).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(MissingManualListingFieldsException);
    expect((error as MissingManualListingFieldsException).missingFields).toEqual(['url', 'price']);
    expect(registry.registerManual).not.toHaveBeenCalled();
    expect(registry.findManualByNormalizedUrl).not.toHaveBeenCalled();
  });

  it('reports only the missing field', async () => {
    const { handler } = setup();

    const error = await handler
      .execute(new ImportManualListingCommand({ url: URL_WITH_NOISE }))
      .catch((e: unknown) => e);

    expect((error as MissingManualListingFieldsException).missingFields).toEqual(['price']);
  });

  it('throws with the existing listing reference when the normalized URL already exists (HR-F001-AC12)', async () => {
    const { handler, registry } = setup({ existing: EXISTING_ID });

    const error = await handler
      .execute(new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 25_000_000 }))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DuplicateManualListingException);
    expect((error as DuplicateManualListingException).listingId).toBe(EXISTING_ID.value);
    expect(registry.findManualByNormalizedUrl).toHaveBeenCalledWith(SOURCE_ID, new ListingUrl(NORMALIZED));
    expect(registry.registerManual).not.toHaveBeenCalled();
  });

  it.each([null, manualSource(false)])('fails when the manual source is missing or disabled (%#)', async (source) => {
    const { handler, registry } = setup({ source });

    await expect(
      handler.execute(new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 1 })),
    ).rejects.toBeInstanceOf(SourceNotAvailableException);
    expect(registry.registerManual).not.toHaveBeenCalled();
  });
});
