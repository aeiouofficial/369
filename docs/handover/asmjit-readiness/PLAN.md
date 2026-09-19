# AsmJit Readiness Plan — 369

Status: PREPARED_ONLY
Branch: `prep/asmjit-readiness-2026-09-19`
Decision: DO NOT INTEGRATE.

The repository is an HTML/interactive book website. Native runtime machine-code generation is not part of the execution model.

## Preferred optimization path
Frontend rendering, asset loading, bundle size, interaction latency, caching, accessibility, and browser performance.

## Revisit trigger
Only a separate native application/runtime with a concrete dynamic-codegen requirement.

No implementation, dependency addition, PR, or merge on this branch.
