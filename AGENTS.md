# Roads to AGI

**Live:** https://roadstoagi.org (also https://roads-to-agi.pages.dev)
**Domains:** roadstoagi.org, roadstoagi.com, generalreasoning.org

## Concept

"All Roads Lead to Runcible" - public adversarial arena for competing explanations of general reasoning. Best explanations survive under test, not editorial preference.

## Architecture

- **Claims** (C-####): Atomic operational assertions with gates
- **Gates** (T-####): Tests (operationalization, prediction, cost, warranty, liability)
- **Roads**: Self-contained dossiers importing claims by ID
- **Challenges** (X-####): Adversarial submissions targeting claims
- **Highway**: Emergent canon (claims surviving across ≥N roads)

## Structure

```
data/
  claims/     # C-####.yaml - atomic assertions
  gates/      # T-####.yaml - test definitions
  roads/      # road.*.yaml - dossiers
  challenges/ # X-####.yaml - adversarial submissions
  highway/    # computed snapshots
  artifacts/  # raw source materials
  events/     # impetus tracking

site/         # Astro static site
  src/pages/  # Home, roads, arena, compare, highway, investors
  src/lib/    # YAML loaders
```

## Commands

```bash
cd site && bun run dev     # Local development
cd site && bun run build   # Production build
```

## Deployment

Cloudflare Pages - auto-deploys from GitHub (once pushed).

## Next Steps

1. Push repo to GitHub
2. Build intake API (/submit endpoint)
3. Add digestive pipeline (agent-assisted claim extraction)
4. Seed more roads from transcripts
5. Add share packs for social distribution

## Related

- Architecture doc: `docs/architecture.json`
- Curt transcript: Referenced in claims as `transcript:curt-2024-12-23`
