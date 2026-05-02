# Changelog

All notable changes to `@deliveriq/mcp` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-05-02

### Added
- `mcpName` field in `package.json` (`io.github.Davison-Francis/deliveriq-mcp`) required for verification on Anthropic's official [MCP Registry](https://registry.modelcontextprotocol.io/).

### Notes
- Listing on the official MCP Registry is now active. Users can discover the server via the registry CLI or the registry's web search.

## [1.1.0] - 2026-05-01

### Changed
- Phase D release published alongside `@deliveriq/sdk@2.0.0`.
- Aligned `domain-intel` field names with actual route response shape.

### Added
- Bundle-size metadata.

## [1.0.3] - 2026-05-01

### Added
- Lockfiles + `bundleSize` metadata after publishing.

## [1.0.2] - 2026-04-22

### Changed
- Maintenance release — package metadata polish.

## [1.0.1] - 2026-04-22

### Changed
- Maintenance release.

## [1.0.0] - 2026-03-05

### Added
- Initial release.
- 12 MCP tools mapping to the 5-stage / 21-check email-verification pipeline:
  - **Format** — RFC 5322 syntax + Sift3 typo detection.
  - **Domain & provider** — disposable detection (164k+ domains), role-prefix detection, free-provider check, alias normalization, pattern entropy.
  - **Mailbox** — MX resolution, ISP identification, SMTP handshake with catch-all probe.
  - **Reputation** — Gravatar, 50 DNSBL zones, RDAP domain age, HIBP breach, 15 DKIM selectors, 6-standard infra score (SPF/DKIM/DMARC/MTA-STS/BIMI/TLS-RPT), MX server reputation.
  - **Scoring** — spam-trap heuristics (13 weighted signals), composite domain trust score, 0–100 deliverability score, classification (Safe / Risky / Invalid / Unknown).

[1.1.1]: https://github.com/Davison-Francis/min8t-sdks/releases/tag/deliveriq-mcp%401.1.1
[1.1.0]: https://github.com/Davison-Francis/min8t-sdks/releases/tag/deliveriq-mcp%401.1.0
[1.0.3]: https://www.npmjs.com/package/@deliveriq/mcp/v/1.0.3
[1.0.2]: https://www.npmjs.com/package/@deliveriq/mcp/v/1.0.2
[1.0.1]: https://www.npmjs.com/package/@deliveriq/mcp/v/1.0.1
[1.0.0]: https://www.npmjs.com/package/@deliveriq/mcp/v/1.0.0
