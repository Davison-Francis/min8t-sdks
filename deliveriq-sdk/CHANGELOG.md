# Changelog

All notable changes to `@deliveriq/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-05-01

### Changed
- **Breaking:** Phase D launch. Aligned `domain-intel` field names with the actual route response (`@deliveriq/sdk` and `@deliveriq/mcp` both updated).
- See migration notes in the [release commit](https://github.com/Davison-Francis/min8t-sdks/commit/c56e6ad).

### Added
- Bundle-size metadata for npm.

## [1.1.2] - 2026-05-01

### Added
- Lockfiles + `bundleSize` metadata after publishing.

## [1.1.1] - 2026-04-22

### Changed
- Maintenance release — package metadata polish.

## [1.1.0] - 2026-04-22

### Changed
- Internal refactors and SDK ergonomics improvements.

## [1.0.0] - 2026-03-05

### Added
- Initial release of the official Node.js SDK for the DeliverIQ email verification API.
- Methods covering the public REST surface:
  - Single-email verification
  - Batch verification (async, up to 100K addresses per job)
  - DNSBL blacklist check
  - Domain intelligence
  - Spam-trap analysis
  - Email finder
  - Organization-pattern intel
  - Account/credit info

[2.0.0]: https://github.com/Davison-Francis/min8t-sdks/releases/tag/deliveriq-sdk%402.0.0
[1.1.2]: https://www.npmjs.com/package/@deliveriq/sdk/v/1.1.2
[1.1.1]: https://www.npmjs.com/package/@deliveriq/sdk/v/1.1.1
[1.1.0]: https://www.npmjs.com/package/@deliveriq/sdk/v/1.1.0
[1.0.0]: https://www.npmjs.com/package/@deliveriq/sdk/v/1.0.0
