# AI site analytics

Approved 2026-11-26: reuse PostHog US project 739712 (`iPunk`). The organization's single-project allowance is already occupied; no new project, plan upgrade or paid product was created. This is filtering within one project, not a data-access isolation boundary.

Every AI event has `site=ai.ipunk.cn`, `page_path`, `page_type`, `locale`, `release_id`, `analytics_implementation=posthog-js` and `traffic_type`. The AI dashboard must require **both** `site=ai.ipunk.cn` and `traffic_type=production`, with existing test-account filters enabled. Never interpret an unfiltered project total as main-site traffic after this release. Existing main-site dashboards and project-wide settings are preserved; their queries should keep their existing `ipunk.cn` page URL filters. SDK persistence is localStorage with the AI-specific name `ipunk_ai`; cross-subdomain cookies are disabled.

## Events and limits

- `$pageview`: one per full HTML load, no hash-navigation pageviews. Browser/session IDs come from the official SDK, not custom random user IDs.
- `article_toc_click`, `article_decision_steps_click`, `related_guide_click`: explicit navigation.
- `article_engaged`: at least 30 seconds in the visible page plus trusted interaction. This does not establish comprehension.
- `external_link_click`: target hostname only. `download_initiated`: link activation, not a verified saved file.
- `tool_run_start`, `tool_run_success`, `tool_run_error`, `tool_run_cancel`: processing lifecycle for compressor, audio extractor, converter, GIF, crop, text-response checker, source-audit import/export. A shared run UUID links start and end. Cheap form validation before processing does not count as a processing failure. Success means the tool finished its checks/output step, not that an AI answer is correct or a downloaded file was subsequently inspected. Cancellation is separate from failure.

No selected files, filenames, pasted responses, claim text, source URLs, raw errors, query/hash parameters or full referrer URLs are accepted by the final event allowlist. No recording, autocapture, exception/console logging, surveys, flags or external SDK dependencies are enabled. No sign-in or server email functions exist, so no identify/server SDK/email tracing is added. Source attribution retains referring hostname only; UTM campaigns are not collected. This is narrower than a full marketing attribution configuration.

## Preferences and internal testing

Basic analytics defaults on, with the same preference keys as the main site's implementation, but storage is per origin. `ipunk.analytics.consent.v1=denied`, DNT/GPC, inaccessible storage, localhost, local IP, preview and worker-default origins all prevent SDK initialization and sending. Privacy-page controls are at `/privacy/` and `/en/privacy/`; no popup or floating control. Denial stops capture and resets SDK identifiers; the next explicit enable may establish a new anonymous identity. A final `before_send` gate rechecks all exclusions.

Before any production browser QA, open **https://ai.ipunk.cn/robots.txt** (no analytics). Set `localStorage.setItem('ipunk.analytics.internal.v1','true')` there and verify the exact string `'true'`. Then open the page. Verify no PostHog network request. Do not assume the main-site origin or a different browser already excludes AI visits.

Only for a dedicated ingestion check: set `ipunk.analytics.test.v1=true`, temporarily remove the internal flag, explicitly enable statistics and reload. All generated events must have `traffic_type=internal_test`; note the test time, paths and release. At the end, restore internal=true, remove test.v1, and verify no further collection. These events are never external visitors or growth evidence. No historical backfill is fabricated.

## Build and release

`npm install` resolves the SDK at initial setup, then the exact version and lockfile are committed. Official npm `posthog-js` 1.455.2 slim no-external module and LICENSE are copied unchanged into dist by `npm run analytics:prepare`. `.env.local` is ignored and contains `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST`, `ANALYTICS_RELEASE`; `.env.example` lists empty names. The generated public `dist/analytics-config.json` contains only the public ingestion token, approved host and release. Source code has no embedded token or ingestion-host fallback. Daily snapshot rendering preserves script/footer wiring and same-language privacy links. The static Worker has no environment-reading backend.

`npm test` covers isolation, privacy/storage refusal, race-time blocking, payload redaction and event contracts. Run `node scripts/check-site.mjs` and local desktop/mobile QA. Production HTTP checks do not execute analytics; one separately labeled browser ingestion test must be confirmed in PostHog before declaring telemetry verified.

Sources checked 2026-11-26: https://posthog.com/docs/libraries/js, https://posthog.com/docs/libraries/js/config, https://posthog.com/docs/libraries/js/security. Current documented defaults snapshot is `2026-08-30`.

## Setup status

Dashboard: https://us.posthog.com/project/739712/dashboard/2416016. Native production-only charts have been saved and executed. The labeled localhost SDK harness ingested synthetic events; this verifies SDK transport, not the production page. Formal deployment remains pending the existing Cloudflare login/authorization. See `data/reports/2026-11-26-ai-analytics-setup.json` for the handoff state.
