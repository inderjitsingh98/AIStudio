# ADR 003: REST And MCP Adapters Reuse One ExecutionService

## Status

Accepted

## Context

The capability must be invocable from both browser workflows and AI clients. Duplicating business logic across REST and MCP handlers would create drift and inconsistent validation or behavior.

## Decision

Use one shared ExecutionService as the business orchestration layer.

- Flask blueprints act as REST adapters.
- FastMCP tool acts as MCP adapter.
- Both invoke the same ExecutionService instance created in create_app().

MCP remains a thin adapter that maps tool inputs to service inputs and translates known service errors to controlled messages.

## Consequences

Positive:
- single source of truth for validation and orchestration
- consistent behavior across interfaces
- lower maintenance and lower drift risk
- easier testing strategy and clearer boundaries

Negative:
- adapter layers still need explicit mapping and error translation
- service contract evolution must be coordinated across both adapters

## Alternatives Considered

1. Separate service implementations for REST and MCP
- rejected due to duplication and behavior drift risk

2. Implement MCP by calling REST endpoints from tool layer
- rejected because direct service invocation is cleaner and avoids protocol indirection

3. Build MCP-only first and defer REST
- rejected because browser and API pathways are both required in the prototype
