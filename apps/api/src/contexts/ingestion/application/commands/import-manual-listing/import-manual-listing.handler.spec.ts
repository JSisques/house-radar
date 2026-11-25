import { describe, expect, it, vi } from 'vitest';

import { DateValueObject } from '@house-radar/building-blocks';
import { ListingId, ListingUrl, Money, SourceId } from '@house-radar/shared-kernel';

import { ImportManualListingCommand } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.command';
import { ImportManualListingHandler } from '@contexts/ingestion/application/commands/import-manual-listing/import-manual-listing.handler';
import type { IListingRegistryPort } from '@contexts/ingestion/application/ports/listing-registry.port';
import { SourceBuilder } from '@contexts/ingestion/domain/builders/source/source.builder';
import { SourceNotAvailableException } from '@contexts/ingestion/domain/exceptions/source-not-available/source-not-available.exception';
import type { ISourceWriteRepository } from '@contexts/ingestion/domain/repositories/write/source-write.repository';
import { SourceKind } from '@contexts/ingestion/domain/value-objects/source-kind/source-kind.value-object';

const URL_WITH_NOISE = 'https://example.com/home/1?ref=a#photos';
const NORMALIZED = 'https://example.com/home/1';
const EXISTING_ID = ListingId.generate();
const NEW_ID = ListingId.generate();
const SOURCE_ID = SourceId.generate();

const manualSource = (enabled = true) =>
  new SourceBuilder().withId(SOURCE_ID).withKind(SourceKind.manual()).withEnabled(enabled).build();

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
  const handler = new ImportManualListingHandler(sources, registry, () => new DateValueObject(new Date('2026-01-01')));
  return { handler, sources, registry, fetchSpy };
};

describe('ImportManualListingHandler', () => {
  it('creates the listing with its first observation and makes no request to the URL (HR-F001-AC1)', async () => {
    const { handler, registry, fetchSpy } = setup();

    const result = await handler.execute(
      new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 25_000_000 }),
    );

    expect(result).toEqual({ status: 'created', listingId: NEW_ID.value });
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

    const result = await handler.execute(new ImportManualListingCommand({ url: '' }));

    expect(result).toEqual({ status: 'invalid', missingFields: ['url', 'price'] });
    expect(registry.registerManual).not.toHaveBeenCalled();
    expect(registry.findManualByNormalizedUrl).not.toHaveBeenCalled();
  });

  it('reports only the missing field', async () => {
    const { handler } = setup();

    expect(await handler.execute(new ImportManualListingCommand({ url: URL_WITH_NOISE }))).toEqual({
      status: 'invalid',
      missingFields: ['price'],
    });
  });

  it('warns and offers checking the listing when the normalized URL already exists (HR-F001-AC12)', async () => {
    const { handler, registry } = setup({ existing: EXISTING_ID });

    const result = await handler.execute(
      new ImportManualListingCommand({ url: URL_WITH_NOISE, priceCents: 25_000_000 }),
    );

    expect(result).toEqual({ status: 'duplicate', listingId: EXISTING_ID.value, action: 'check_listing' });
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
