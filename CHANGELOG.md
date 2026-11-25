# Changelog

## 0.1.0 (2026-11-25)


### Features

* add turborepo task pipeline and strict base tsconfig ([c2cd6a1](https://github.com/JSisques/house-radar/commit/c2cd6a1657960b60b3617bf1adaed07524b6da0c))
* add turborepo task pipeline and strict workspace tooling ([bb1d09c](https://github.com/JSisques/house-radar/commit/bb1d09c31b1c6e09ab21961d2edd8215b3de34b0))
* **api:** add MikroORM per-context schema migrations ([d3c9ce3](https://github.com/JSisques/house-radar/commit/d3c9ce3f39bf1d544a53ba8e55cfb6a1dab64e9c))
* **api:** add MikroORM per-context schema migrations ([cd01a01](https://github.com/JSisques/house-radar/commit/cd01a013cc8e5fb5aa89e85c7186ac5069d934a2))
* **api:** add NestJS skeleton with CQRS, validated config and OpenAPI ([4499a1b](https://github.com/JSisques/house-radar/commit/4499a1bfdef5f660f058a1ac9f320f13980edce0))
* **api:** add NestJS skeleton with CQRS, validated config and OpenAPI ([dbe8b2f](https://github.com/JSisques/house-radar/commit/dbe8b2fce1161d3cf335cc94716beb5f49574f58))
* **api:** add outbox relay and idempotent consumers ([e7aa873](https://github.com/JSisques/house-radar/commit/e7aa873532351a918d0b491b64b571687119fef4))
* **api:** add outbox_event migrations for event-emitting contexts ([b7099d0](https://github.com/JSisques/house-radar/commit/b7099d008c46dc99026dd7b1613f67a318a8858c))
* **api:** add terminus health check for postgres and redis ([6b2bc5d](https://github.com/JSisques/house-radar/commit/6b2bc5d4f85b9043bd94ea9d620f251e28258fb0))
* **api:** add terminus health check for postgres and redis ([668b8a6](https://github.com/JSisques/house-radar/commit/668b8a67df7c9d4ac3dc138235adf3931b906a4f))
* **api:** add transaction manager and outbox-aware write repository base ([170b3e5](https://github.com/JSisques/house-radar/commit/170b3e563f3e0564a3eeb68d04e0e92156be9dc0))
* **api:** outbox relay and idempotent consumers ([f135ba4](https://github.com/JSisques/house-radar/commit/f135ba43b6ed75a620b09f68fa32274f8ad7e331))
* **api:** outbox table, transaction manager and outbox-aware write repository base ([fe2b4ae](https://github.com/JSisques/house-radar/commit/fe2b4aef891a34bf06d54dc224d4f10298df4a50))
* **api:** publish outbox rows to BullMQ with the event id as job id ([7735f74](https://github.com/JSisques/house-radar/commit/7735f74cc802b75bc062db369239964ebd1a4fb3))
* **build:** add allowBuilds configuration for various packages ([1d0ae89](https://github.com/JSisques/house-radar/commit/1d0ae894ede419797de36c7d2327e58988092a01))
* **build:** add allowBuilds configuration for various packages ([71bbea5](https://github.com/JSisques/house-radar/commit/71bbea58ef0c956767e543e09c28510599a4c031))
* **building-blocks:** add aggregate root, domain events and field-is-required exception ([6dc8a2a](https://github.com/JSisques/house-radar/commit/6dc8a2a7a13ab834a0c26dd56b8d191946bc8123))
* **building-blocks:** add aggregate root, domain events and field-is-required exception ([d5fe41e](https://github.com/JSisques/house-radar/commit/d5fe41efbf784f87dccbeb6fdb53dbd1e92eca2e))
* **building-blocks:** add repository ports, criteria, builder factory and UUIDv7 ([29b45d6](https://github.com/JSisques/house-radar/commit/29b45d608d94648767e810f4cbdb5624b43f64b2))
* **building-blocks:** add repository ports, criteria, builder factory and UUIDv7 ([5ffd3c9](https://github.com/JSisques/house-radar/commit/5ffd3c9d1dec57fa899e1872df617a1cbf53831e))
* **building-blocks:** add value object base and generic value objects ([126eb49](https://github.com/JSisques/house-radar/commit/126eb499731978ce6684d810e8be0691e2b6519f))
* **building-blocks:** add value object base and generic value objects ([#154](https://github.com/JSisques/house-radar/issues/154)) ([92a19a0](https://github.com/JSisques/house-radar/commit/92a19a08955920d32246dc9a74a899fb3990f117))
* **building-blocks:** allow composite primitives in ValueObject ([c5322a7](https://github.com/JSisques/house-radar/commit/c5322a7c43652ebdcf676d524bcdb64e0327e9cb))
* **ci:** add CI workflow for lint, format, tests and commitlint ([a9c1710](https://github.com/JSisques/house-radar/commit/a9c17107491dbe26ec5349a2b651c4f241f27c68))
* **ci:** add CI workflow with turbo filtered tasks and commitlint check ([2e801cd](https://github.com/JSisques/house-radar/commit/2e801cda36faf551104795ff101cdfec8747cd03))
* **ci:** add release-please for single product version release ([5127000](https://github.com/JSisques/house-radar/commit/5127000e025909c1c273d07393a71adadcd31ade))
* **ci:** add release-please with a single product version ([6a57dcc](https://github.com/JSisques/house-radar/commit/6a57dcc32f0c2a30f82e241d207a7e0a64109017))
* **infra:** add Docker Compose with PostgreSQL + PostGIS and Redis ([3ebc935](https://github.com/JSisques/house-radar/commit/3ebc93508b67acd5495382e7698afa1867009cab))
* **infra:** Docker Compose with PostgreSQL + PostGIS and Redis ([1ff1807](https://github.com/JSisques/house-radar/commit/1ff18072ed4b1917975b9e0ed5d8f7490577ba2c))
* **infra:** use high, uncommon host ports for postgres and redis ([9c9b8e1](https://github.com/JSisques/house-radar/commit/9c9b8e1925e8b059fd82221a2e75c95c129fda43))
* **lint:** add base path aliases and resolve them in boundaries ([c329d68](https://github.com/JSisques/house-radar/commit/c329d680fae3db8436d7ecb249589ce785fc8744))
* **lint:** add path aliases and document the eslint setup ([e7d3bbf](https://github.com/JSisques/house-radar/commit/e7d3bbfb38e247cb4533aad5824ef4c56db7f673))
* **lint:** add shared eslint flat config with boundaries and import sorting ([5f8e3a4](https://github.com/JSisques/house-radar/commit/5f8e3a43b99d5d9aa98751b7d6ec036455910c57))
* **lint:** enforce frontend layer boundaries for containers and atomic design ([5d7560a](https://github.com/JSisques/house-radar/commit/5d7560a7b9fecf00616452a1bbcfc68fed826c81))
* **shared-kernel:** add geo, catalogs, provenance and cross-context identities ([57fd643](https://github.com/JSisques/house-radar/commit/57fd643c0b805bd88425d116b9ad7030a4ecb0d1))
* **shared-kernel:** add geo, catalogs, provenance and cross-context identities ([c855f71](https://github.com/JSisques/house-radar/commit/c855f714730d312a0f28f5347f2fe41d24b4ff07)), closes [#26](https://github.com/JSisques/house-radar/issues/26)
* **shared-kernel:** add Money, Area, PricePerSquareMeter and Known/Unknown data origin ([240b54e](https://github.com/JSisques/house-radar/commit/240b54efc54770dc6e2620baa5e793b4fe5c50aa))
* **shared-kernel:** add Money, Area, PricePerSquareMeter and Known/Unknown data origin ([f5bfa82](https://github.com/JSisques/house-radar/commit/f5bfa827e5e72898a71e6a6730b34e474fc05952)), closes [#25](https://github.com/JSisques/house-radar/issues/25)
* **testing:** add Testcontainers helpers for integration specs ([e6d1b95](https://github.com/JSisques/house-radar/commit/e6d1b9595b834544db463220e584707a810e36c9))
* **testing:** add Testcontainers helpers for integration specs ([a3c3da3](https://github.com/JSisques/house-radar/commit/a3c3da3cdc0d7e43652ec994449643fcce09336b))
* **web:** add MSW, Storybook and atomic design folders ([6117bea](https://github.com/JSisques/house-radar/commit/6117bea0a8f16eb89f7779bf7bc3fc3d6fcef3d8))
* **web:** add MSW, Storybook and atomic design folders ([85ecc5c](https://github.com/JSisques/house-radar/commit/85ecc5c9a8b458465e39d9015bd47572f5d8f862))
* **web:** add react-i18next adapter and composition root ([91273d9](https://github.com/JSisques/house-radar/commit/91273d99846d1ba5b998da7fab42469b2152abc2))
* **web:** add react-i18next adapter and composition root ([fe0b241](https://github.com/JSisques/house-radar/commit/fe0b2415c64286a0d10fcbbcef6f12288d0a506f))
* **web:** add typed OpenAPI client port, adapter and CI drift check ([031656c](https://github.com/JSisques/house-radar/commit/031656c9f337080fdf41ef431c1a6a1741d1dd5c))
* **web:** add typed OpenAPI client port, adapter and CI drift check ([e074828](https://github.com/JSisques/house-radar/commit/e07482848c40ea1dbb548581b8a2b4daeb399649))
* **web:** add Vite skeleton with TanStack Router and Query ([903c945](https://github.com/JSisques/house-radar/commit/903c945f0ad53f3225f10823b039e011be74278f))
* **web:** add Vite skeleton with TanStack Router and Query ([c598cfb](https://github.com/JSisques/house-radar/commit/c598cfb911543bf78bac2e900cd8aff047f6717d))


### Bug Fixes

* **api:** type ORM option overrides with the PostgreSQL driver ([3944d37](https://github.com/JSisques/house-radar/commit/3944d37c540f29054106c7d831d14bc45b29348d))
* **building-blocks:** pin uuid exactly and allow pinned dependencies in workspace test ([f41469a](https://github.com/JSisques/house-radar/commit/f41469aedca48b8107e9ed07d2d50cb283859241))
* **ci:** correct release-please manifest format and add version file ([82b09f0](https://github.com/JSisques/house-radar/commit/82b09f0ea0fe016ee7f2040175c5c6ffea0561a3))

## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
