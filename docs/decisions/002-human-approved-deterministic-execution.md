# ADR 002: AI Proposes Structured Rules, Human Approves, Deterministic Engine Executes

## Status

Accepted

## Context

Within CapabilityForge AI, enterprise-style governance requires safe paths from AI suggestion to execution.

Enterprise environments need governed data-quality actions. Automatically executing unconstrained AI output is risky and difficult to audit.

The prototype needed to demonstrate a safe path from suggestion to execution while preserving transparency and repeatability.

## Decision

Adopt a two-stage workflow:

1. AI provider proposes structured candidate rules and stores an execution in awaiting_approval state.
2. A human approves selected rules.
3. DeterministicRuleEngine executes approved rules against sample records and produces a scorecard.

Execution state transitions are constrained to:
awaiting_approval -> completed.

## Consequences

Positive:
- explicit human governance gate before execution
- deterministic and explainable execution behavior
- auditable metadata and scorecard outputs
- reliable, testable backend behavior

Negative:
- adds one manual interaction step
- reduces speed versus fully automated autonomous execution

## Alternatives Considered

1. Auto-execute all generated rules immediately
- rejected due to governance and risk concerns

2. Let provider return executable code snippets
- rejected because deterministic backend controls are preferred

3. Keep only generation with no execution
- rejected because product goals require end-to-end vertical slice value
