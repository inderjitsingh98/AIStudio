# ADR 001: Provider Abstraction With Deterministic Mock Provider

## Status

Accepted

## Context

The prototype needs AI-assisted rule generation while maintaining repeatability, testability, and clear separation between orchestration and provider implementation.

A direct dependency from core workflow logic to one concrete provider would make testing harder and would couple the prototype to one implementation style.

## Decision

Introduce an AIProvider abstraction and implement MockAIProvider as the initial provider.

ExecutionService depends on the AIProvider contract, not on provider internals. MockAIProvider generates deterministic structured candidate rules based on input columns and requirements.

## Consequences

Positive:
- deterministic output enables stable automated tests
- orchestration logic remains provider-agnostic
- future real-provider adapters can be introduced behind the same contract

Negative:
- mock provider behavior is intentionally limited and not semantically rich
- additional adapter code will be required for production model integrations

## Alternatives Considered

1. Hard-code generation logic directly in ExecutionService
- rejected because it collapses orchestration and provider concerns

2. Call an external model API directly from Flask routes
- rejected because routes should remain thin and deterministic tests would be fragile

3. Implement real-provider integration first
- rejected for prototype stage due to cost, nondeterminism, and operational overhead
