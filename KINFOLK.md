# KINFOLK.md — read this before touching anything

You are working on Kinfolk's own code. This file is the DNA: what the thing is, how it's built, what must never break, and how a change gets in. If you are an agent session opened on this repo, read this entire file before your first edit.

## What Kinfolk is

A single-file web app (`index.html`) plus a service worker (`sw.js`) and a manifest. It runs entirely in the user's browser, talks directly to OpenRouter, fal.ai and other providers with the user's own keys, and keeps all data in IndexedDB on the device. There is no server of ours in the loop. A companion Node process (`kinfolk-agent/server.js`) runs on the user's computer and adds repo tools and a relay.

Named after a real man. The persona is a tribute, not a costume — see PERSONAS.kinfolk in the code. Don't make it a caricature.

## Non-negotiables

1. **Keys never leave the device** except in a request to the provider they belong to. No telemetry, no third-party analytics, no key in any file in this repo.
2. **The user can always see the money.** Every request that costs something updates the ledger. Never add a call that spends silently.
3. **Nothing writes to the user's data without a path to undo it.** Memory ops, label ops, patches and file versions all have Undo or history. Keep it that way.
4. **Protocol sections are code, not prompt.** They live in the `PROTOCOL` constant and are appended at request time. Never move them into the editable system prompt — that's how they went stale once.
5. **One file.** `index.html` stays self-contained. CDN libraries are loaded lazily via `lib()`; no build step, no bundler.
6. **Version every release.** Bump `APP_VERSION` in `index.html` and the cache name in `sw.js` together. If only one changes, the phone keeps serving the old build.

## Layout of index.html

Everything is in one `<script>` at the bottom. Sections are marked with `/* ---------- name ---------- */` comments. In order of dependency:

- **helpers** — `$`, `esc`, `uid`, `toast`, `download`, `fmt*`, `lib()` (lazy CDN loader)
- **storage** — `DB` (IndexedDB: `convs`, `kv`, `projects`), `kvGet/kvSet`
- **settings** — `S` (defaults), `PERSONAS`, `DIALS`, `PROTOCOL`, `DEFAULT_SYSTEM`, `DEFAULT_CATALOG`, `loadSettings` (also migrates old data)
- **memory** — `MEM`, `applyOps`, `memBlock`, import parsing
- **spend / budget / estimate** — ledgers, `renderRibbon`, `estimate`, `updateEst`, compaction, `helperCall`
- **OpenRouter truth** — `orKeyInfo`, `genCost`
- **themes**
- **models** — `MODELS` from OpenRouter, `P` (id patterns), `tier`, `perTurn`, lanes (`LANES`, `laneModel`, `LANE_PREF`), coverage (`CAPS`, `covers`, `standInFor`, `specialistFor`), marketplace rendering, `setModel`
- **media marketplace**, **model profile**, **companies & flags**
- **projects** — versioned files (`saveToProject`), briefs, `projBlock`, zip export
- **label** — roster, jobs, money, `labelBlock`, `applyLabelOps`
- **storyboards**, **content mode**, **fal generation** (`falQueue`, `runGeneration`)
- **working files & patches** — `outline`, `applyPatch`, `findWorkFile`
- **agent client** — `agentCfg`, sessions, `sendAgent`, steps drawer
- **conversations** — `CUR`, `CONVS`, drawer, ⋯ menu
- **effects**, **working animation** (the dancing K, `WORDS`), **thoughts drawer**, **code tabs**
- **rendering** — `extractBlocks`, `renderBody`, `msgEl`, `renderChat`. Every `` ```kind `` block the model can emit is handled here.
- **sending** — `buildMessages` (assembles the system prompt: DEFAULT_SYSTEM + PROTOCOL + gen + orchestrator note + memory + project + label), `send`, `run` (the streaming + tool loop), `continueReply`, `retry`
- **orchestrator tools** — `orchTools`, `runTool`, `subCall`
- **Obsidian / export**, **sheets & settings UI**, **brand / help / tour**, **app updates**, **device**, **boot**

## Blocks the model can emit (all parsed in `extractBlocks` / `run`)

`file=` (downloadable file) · `patch file=` (SEARCH/REPLACE hunks) · `read-lines` · `open-file` · `memory-ops` · `label-ops` · `ask` · `generate` · `storyboard`. If you add one: regex constant near `OPS_RE`, exclude it from code tabs in `parseCode` (`/^(memory|open-file|…)/`), render it in `renderBody`, and document it in `PROTOCOL`.

## How a change gets in

1. Work on a branch: `kinfolk/<short-name>`. Never commit to `main` directly. Never `git push` without the user's explicit approval in the session.
2. Make the change with `edit_file` (patches), not `write_file`, unless creating a new file.
3. Bump `APP_VERSION` and the `sw.js` cache name.
4. Run the checks below. If any fails, fix or revert — do not hand the user a broken build.
5. Update `CHANGELOG.md`: one line, what changed and why.
6. Show the user the diff and stop. They decide whether it merges.

## Checks (run before proposing any change)

```
node -e "const fs=require('fs');const h=fs.readFileSync('index.html','utf8');const js=h.match(/<script>([\s\S]*)<\/script>/)[1];fs.writeFileSync('/tmp/k.js',js)" && node --check /tmp/k.js
node --check sw.js
grep -c "APP_VERSION='v" index.html          # must be 1
grep -o "APP_VERSION='v[0-9]*'" index.html   # must match the number in sw.js cache name
grep -o "kinfolk-v[0-9]*" sw.js | head -1
```

Also confirm: no duplicate `id="..."` in the HTML, no `console.log` left in, no key or token in any file.

## What "self-improvement" is allowed to mean

Fix a bug you can reproduce. Make an existing feature more reliable. Improve copy, spacing, accessibility. Add a small feature the user asked for in this session.

It does not mean: redesigning the UI, changing the persona, altering budget or permission logic, adding dependencies, adding network calls to new hosts, or touching anything under "Non-negotiables". Those need a human and a conversation, not a commit.

If you're unsure whether something is in scope, it isn't. Ask.
