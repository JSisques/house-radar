---
title: "HR-F001: Listing ingestion"
description: "The system must bring in properties from different sources through independent connectors."
sidebar:
  order: 1
---

- **Priority:** P0
- **Source section:** 1
- **Responsible module:** To be defined

The system must bring in properties from different sources through independent connectors.

## Requirements

- [ ] Architecture of independent connectors per source.
- [ ] Integration with the first authorized listing source.
- [ ] Preparation of connectors for future sources.
- [ ] Periodic execution of collection processes.
- [ ] Discovery of new listings.
- [ ] Extraction of listing information.
- [ ] Extraction of images when their use is allowed.
- [ ] Unique identification of each listing in its source.
- [ ] Logging of extraction errors.
- [ ] Automatic retries on temporary errors.
- [ ] Control of already processed listings.
- [ ] Manual import by URL.
- [ ] Recording of the last update date.

## Notes

- **Legal and operational consideration:** before implementing a connector, review the source's terms of use, APIs, feeds, and permissions. Do not assume that automated extraction is allowed. When there is no authorization, manual imports, links, or other permitted sources can be used.
- Related decisions: [D3](/adr/d03-source-strategy/) (sources) and [D7](/adr/d07-queues-and-scheduling/) (BullMQ + Redis for execution, repeatable jobs, and retries with backoff).
- Acceptance criteria and dependencies: to be defined in the detailed functional specification.
