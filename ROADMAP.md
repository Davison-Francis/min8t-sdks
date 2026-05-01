# Roadmap

Real upcoming work across the three packages. PRs / issues welcome.

## `@deliveriq/mcp`

- [ ] **Streaming tool for batch jobs > 1000 emails** — currently the
      `deliveriq_batch_download` tool returns the full CSV in one shot.
      For large jobs this either blows up the LLM context or truncates
      silently. Switch to a paginated/streaming response so Claude can
      process 10k+ verifications without a 30k-token tool result.
- [ ] **Auto-detect rate limit + pre-throttle** — read the
      `X-RateLimit-Remaining` header from the DeliverIQ API and have the
      server self-throttle before the user hits a 429. Surface the budget
      as a tool annotation so the LLM can plan around it.
- [ ] **`deliveriq_email_pattern_finder` tool** — given a domain, infer
      the most likely email pattern (`first.last@`, `flast@`, etc.) by
      probing 6-8 known seed names. Currently you have to call
      `deliveriq_find_email` once per known person and the model figures
      it out manually.
- [ ] **Resource subscription for batch progress** — instead of polling
      `deliveriq_batch_status` from the model, expose batch progress as
      an MCP resource the client can subscribe to, so progress updates
      stream into the conversation.

## `@deliveriq/sdk`

- [ ] **Browser bundle (UMD + ESM)** — currently Node-only. Verify the
      package works under Cloudflare Workers + Vercel Edge, ship a
      `dist/browser.js` bundle.
- [ ] **Webhook signature verification helper** — `client.webhooks.verify(payload, signature)`
      for batch-completed callbacks.

## `@min8t.com/plugin-sdk`

- [ ] **React `<MinEditor>` component** — drop-in component instead of
      the imperative `Min8T.init({...})` API.
- [ ] **Server-side render of the editor's HTML output** — preview a
      finished design in a static <iframe> without booting the full
      editor.

---

If any of the above is something you'd actually use, open an issue and
say so — it bumps priority. If something's missing that you'd want, also
open an issue.
